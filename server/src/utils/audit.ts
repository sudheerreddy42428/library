import prisma from '../prisma';

export const logAudit = async (userId: number, action: string, entity: string, entityId: string, description: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};
