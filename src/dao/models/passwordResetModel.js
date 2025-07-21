import mongoose from "mongoose";

const passwordResetCollection = "passwordResets";

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Expira en 1 hora (3600 segundos)
    },
    used: {
        type: Boolean,
        default: false
    }
});

// Índice para optimizar búsquedas por token
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ email: 1 });

export const passwordResetModel = mongoose.model(passwordResetCollection, passwordResetSchema);
