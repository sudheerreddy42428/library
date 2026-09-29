import prisma from '../prisma';

export const sendNotification = async (studentId: number, type: string, message: string) => {
  try {
    await prisma.notification.create({
      data: {
        studentId,
        type,
        message
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
