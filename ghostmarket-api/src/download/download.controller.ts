import { Controller, Get, Param, Query, Res, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importar a guarda

// A rota no Frontend é: GET /download/secure/:productId?key=...

@Controller('download')
export class DownloadController {

    // Rota completa: /download/secure/ID_PRODUTO
    // NOTA: A rota de download não precisa do token JWT, ela precisa da KEY TEMPORÁRIA
    @Get('secure/:productId')
    handleDownload(
        @Param('productId') productId: string,
        @Query('key') key: string,
        @Query('expires') expires: string,
        @Res() res: Response // Injeta o objeto de resposta nativo do Express
    ) {
        // 1. CHECAGEM BÁSICA DE SEGURANÇA (VALIDAÇÃO DA CHAVE)
        // No Service de Orders, a chave foi gerada assim: uniqueKey = item.price.toString() + orderId.substring(0, 4);
        // Para um teste funcional, vamos garantir que a chave e a data existem.

        // Simplificando a segurança para fins de teste:
        const expirationTime = parseInt(expires, 10);

        if (!key || !expires || expirationTime < Date.now()) {
            throw new HttpException('Link de download expirado ou inválido.', HttpStatus.UNAUTHORIZED);
        }

        // 2. ENCONTRAR O NOME REAL DO ARQUIVO NO DISCO
        // Em produção, isso viria do banco, mas aqui assumimos que o ProductId está ligado ao nome.
        // Como usamos o Multer (armazenamento local) anteriormente, os nomes dos arquivos são UUIDs longos.

        // A rota de download seguro só pode ser testada se você tiver um arquivo na pasta /uploads.

        // ******* SIMULAÇÃO DE BUSCA DO NOME DO ARQUIVO REAL *******
        // Para fechar o ciclo agora, vamos procurar pelo arquivo mais recente na pasta uploads

        const uploadsDir = path.join(process.cwd(), 'uploads');

        // Nota: Esta parte é puramente para DEMONSTRAÇÃO. O método correto seria buscar 
        // o 'storageKey' no banco usando o 'productId' e um Service dedicado.

        // Para o teste, vamos usar o arquivo mais recente que o Admin subiu (ou um mock file)
        let filename = '';
        try {
            const files = fs.readdirSync(uploadsDir);
            // O primeiro arquivo que não for oculto é o nosso mock
            filename = files.find(f => !f.startsWith('.')) || 'Havenn_Asset_1a7c3d29.zip'; // Fallback
        } catch (e) {
            throw new HttpException('Pasta de uploads inacessível. O Backend não pode entregar o arquivo.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // 3. CONSTRUÇÃO DO CAMINHO COMPLETO
        const filePath = path.join(uploadsDir, filename);

        // 4. VERIFICAR EXISTÊNCIA E ENVIAR
        if (!fs.existsSync(filePath)) {
            // Se o produto foi criado sem upload real, ele vai cair aqui.
            throw new HttpException(`Arquivo '${filename}' não encontrado no servidor. (O upload real falhou ou foi simulado)`, HttpStatus.NOT_FOUND);
        }

        // Enviar o arquivo. O 'res.sendFile' usa o Express para entregar o arquivo ao cliente.
        return res.sendFile(filename, { root: uploadsDir });
    }
}