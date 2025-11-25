export const downloadEmailTemplate = (
    orderId: string,
    productTitle: string,
    downloadLink: string,
    licenseKey: string
): string => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #09090b; color: #f4f4f5; border: 1px solid #1f2937;">
        <h2 style="color: #6366f1;">Obrigado por sua compra no Havenn Market!</h2>
        <p>Seu pedido **#${orderId.substring(0, 8)}** foi concluído com sucesso.</p>
        
        <h3 style="color: #e4e4e7;">Sua Chave de Licença:</h3>
        <p style="font-weight: bold; color: #4f46e5; background-color: #1f2937; padding: 10px; border-radius: 5px; text-align: center;">
          ${licenseKey}
        </p>
        <p style="margin-top: 15px;">Use esta chave para ativar seu software.</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${downloadLink}" 
             style="display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            BAIXAR AGORA
          </a>
        </div>
        
        <p style="margin-top: 25px; font-size: 0.85em; color: #9ca3af;">
          O link de download é válido por 24 horas.
        </p>
      </div>
    `;
};
