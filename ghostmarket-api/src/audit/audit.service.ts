import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log an audit event to the database
     * @param action - Type of action being logged
     * @param userId - ID of user who performed action (optional for failed logins)
     * @param email - Email address involved (useful for failed logins)
     * @param ipAddress - IP address of the request
     * @param userAgent - Browser/client user agent string
     * @param details - Additional JSON or text details about the event
     */
    async logEvent(
        action: AuditAction,
        userId?: string,
        email?: string,
        ipAddress?: string,
        userAgent?: string,
        details?: string,
    ) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    action,
                    userId,
                    email,
                    ipAddress,
                    userAgent,
                    details,
                },
            });
        } catch (error) {
            // Log error but don't fail the main operation
            console.error('Failed to create audit log:', error);
        }
    }

    /**
     * Get recent audit logs with optional filtering
     * @param limit - Maximum number of logs to return
     * @param userId - Filter by specific user
     * @param action - Filter by specific action
     */
    async getRecentLogs(limit: number = 50, userId?: string, action?: AuditAction) {
        return await this.prisma.auditLog.findMany({
            where: {
                ...(userId && { userId }),
                ...(action && { action }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }

    /**
     * Get audit log statistics
     */
    async getStats() {
        const [totalLogs, loginSuccessCount, loginFailedCount, unauthorizedCount] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.count({ where: { action: 'LOGIN_SUCCESS' } }),
            this.prisma.auditLog.count({ where: { action: 'LOGIN_FAILED' } }),
            this.prisma.auditLog.count({ where: { action: 'UNAUTHORIZED_ACCESS' } }),
        ]);

        return {
            totalLogs,
            loginSuccessCount,
            loginFailedCount,
            unauthorizedCount,
        };
    }
}
