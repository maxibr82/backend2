/**
 * Data Transfer Object para User
 * Define la estructura de datos que se expone al cliente
 */
class UserDTO {
    constructor(user, includePassword = false) {
        this.id = user._id || user.id;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        // Asegurar que cartId siempre sea un string
        this.cartId = user.cart ? user.cart.toString() : null;
        // Solo incluir password si se especifica explícitamente (para autenticación)
        if (includePassword) {
            this.password = user.password;
        }
    }

    static fromArray(users) {
        return users.map(user => new UserDTO(user));
    }

    /**
     * Método para la respuesta de la API
     * Devuelve solo los datos seguros del usuario
     */
    toResponse() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            age: this.age,
            role: this.role,
            cartId: this.cartId
        };
    }

    /**
     * Método para la respuesta de la API con formato legacy
     * Mantiene compatibilidad con el formato anterior
     */
    toLegacyResponse() {
        return {
            _id: this.id,
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            age: this.age,
            cart: this.cartId,
            role: this.role
        };
    }
}

export { UserDTO };
