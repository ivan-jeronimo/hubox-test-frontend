import { defineStore } from "pinia";
import { apiService } from "../services/apiService"; // Importamos apiService para usarlo en acciones

export const useAuthStore = defineStore("auth", {
  id: 'auth', // Es buena práctica definir un ID para el store
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    authCheckCompleted: false, // Para saber si ya se intentó verificar la autenticación
  }),
  actions: {
    // Acción para establecer los datos de autenticación
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      this.isAuthenticated = true;
      this.authCheckCompleted = true;

      // Persistir en localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", token); // Usamos 'access_token' para consistencia con apiService
    },

    // Acción para actualizar solo los datos del usuario (ej. después de actualizar el perfil)
    setUser(user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },

    // Acción para cerrar sesión
    async logout() { // Ahora es asíncrona
      // Intentar invalidar el token en el backend
      if (this.token) {
        try {
          await apiService.auth.logout(); // Llamada al endpoint de logout
        } catch (error) {
          console.error("❌ Error al invalidar token en el backend:", error);
          // No bloqueamos el logout local aunque falle el backend
        }
      }

      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.authCheckCompleted = true; // Se completó el chequeo (al cerrar sesión)

      // Limpiar localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      // Opcional: Redirigir al inicio o login
      // La redirección se maneja en el interceptor de apiService o en el router guard
    },

    // Acción para intentar hidratar el store desde localStorage
    hydrateFromLocalStorage() {
      try {
        const rawUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("access_token");

        this.user = null; // Resetear antes de hidratar
        this.token = null;
        this.isAuthenticated = false;
        this.authCheckCompleted = false; // Resetear para que checkAuth se ejecute si es necesario

        if (storedToken) { // Solo necesitamos el token para saber si hay una sesión potencial
          this.token = storedToken;
          // Si hay token, intentamos cargar el usuario para una carga rápida de UI
          if (rawUser) {
            this.user = JSON.parse(rawUser);
            // NO establecer isAuthenticated = true aquí. checkAuth lo hará si el token es válido.
          }
        }
      } catch (error) {
        console.error("❌ Error hidratando authStore desde localStorage:", error);
        this.logout(); // Si hay un error al parsear, mejor limpiar
      }
    },

    // Acción para verificar la validez del token con el backend
    async checkAuth() {
      // Si ya estamos autenticados y tenemos datos de usuario, y el token existe,
      // asumimos que ya se verificó y es válido.
      if (this.isAuthenticated && this.user && this.token) {
        this.authCheckCompleted = true;
        return true; // Autenticación ya verificada y válida
      }

      // Si no hay token, no hay nada que verificar con el backend
      if (!this.token) {
        this.logout(); // Asegurarse de que el estado esté limpio
        this.authCheckCompleted = true;
        return false;
      }

      // Si tenemos un token pero el estado no está completamente verificado (isAuthenticated=false o user=null)
      try {
        // Intentar obtener el perfil del usuario. Si el token es inválido, el interceptor de Axios lo manejará.
        const userProfile = await apiService.user.getProfile();
        this.setUser(userProfile); // Guardar los datos del usuario obtenidos
        this.isAuthenticated = true; // Marcar como autenticado
        this.authCheckCompleted = true;
        return true; // Autenticación exitosa
      } catch (error) {
        // Si la llamada a getProfile falla (ej. 401 por token expirado),
        // el interceptor de Axios ya debería haber llamado a logout.
        console.error("❌ Error verificando token con el backend:", error);
        // Asegurarse de que el estado esté limpio si el interceptor no lo hizo por alguna razón
        if (this.token) { // Si todavía hay un token, significa que el error no fue 401 o el interceptor falló
          this.logout();
        }
        this.authCheckCompleted = true;
        return false; // Autenticación fallida
      }
    }
  },
});
