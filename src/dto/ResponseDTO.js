/**
 * DTO base para respuestas
 */
class ResponseDTO {
    constructor(status, data, message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    toResponse() {
        return {
            status: this.status,
            message: this.message,
            data: this.data
        };
    }
}

/**
 * DTO para respuestas de paginación
 * Define la estructura de datos para respuestas paginadas
 */
class PaginationResponseDTO {
    constructor(paginatedData) {
        this.docs = paginatedData.docs || [];
        this.totalDocs = paginatedData.totalDocs || 0;
        this.limit = paginatedData.limit || 10;
        this.totalPages = paginatedData.totalPages || 0;
        this.page = paginatedData.page || 1;
        this.pagingCounter = paginatedData.pagingCounter || 1;
        this.hasPrevPage = paginatedData.hasPrevPage || false;
        this.hasNextPage = paginatedData.hasNextPage || false;
        this.prevPage = paginatedData.prevPage || null;
        this.nextPage = paginatedData.nextPage || null;
        this.prevLink = paginatedData.prevLink || null;
        this.nextLink = paginatedData.nextLink || null;
    }

    toResponse() {
        return {
            status: 'success',
            payload: this.docs,
            totalPages: this.totalPages,
            prevPage: this.prevPage,
            nextPage: this.nextPage,
            page: this.page,
            hasPrevPage: this.hasPrevPage,
            hasNextPage: this.hasNextPage,
            prevLink: this.prevLink,
            nextLink: this.nextLink
        };
    }
}

/**
 * DTO para respuestas de error
 */
class ErrorResponseDTO {
    constructor(message, status = 'error', details = null) {
        this.status = status;
        this.message = message;
        if (details) {
            this.details = details;
        }
    }

    toResponse() {
        const response = {
            status: this.status,
            message: this.message
        };

        if (this.details) {
            response.details = this.details;
        }

        return response;
    }
}

/**
 * DTO para respuestas exitosas
 */
class SuccessResponseDTO {
    constructor(message = 'Operación exitosa', payload = null) {
        this.status = 'success';
        this.message = message;
        this.payload = payload;
    }

    toResponse() {
        const response = {
            status: this.status,
            message: this.message
        };

        if (this.payload !== null) {
            response.data = this.payload;
        }

        return response;
    }
}

export { ResponseDTO, PaginationResponseDTO, ErrorResponseDTO, SuccessResponseDTO };
