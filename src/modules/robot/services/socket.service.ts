// src/gateways/sort-ws.gateway.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

@Injectable()
export class SocketService implements OnModuleInit {
    private wss: WebSocketServer;

    onModuleInit() {
        const server = createServer(); // bạn có thể dùng cùng HTTP server nếu muốn
        this.wss = new WebSocketServer({ server });

        this.wss.on('connection', (ws) => {
            console.log('📡 Client connected to WS');

            ws.send(JSON.stringify({
                message: '✅ Kết nối WebSocket thành công!',
            }));
        });

        server.listen(8081, () => {
            console.log('🌐 WS server is running on ws://localhost:8081');
        });
    }

    notify() {
        const data = JSON.stringify({
            event: 'sorted-complete',
            message: 'Hàng hóa đã phân loại xong!',
            time: new Date(),
        });

        this.wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(data);
            }
        });
    }
}
