// resources/js/utils/whatsapp.utils.ts
export const sendWhatsApp = (phone: string, message: string) => {
    // Eliminar cualquier caracter no numérico del teléfono
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Abrir en nueva ventana
    window.open(whatsappUrl, '_blank');
};

export const createPriceQueryMessage = (producto: { codigopro?: string; nombre: string }): string => {
    const codigo = producto.codigopro ? ` (${producto.codigopro})` : '';
    return `Hola Guille, necesito precio actualizado de ${producto.nombre}${codigo} para presupuestar. ¡Gracias!`;
};