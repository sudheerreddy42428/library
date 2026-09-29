import prisma from '../prisma';

export const updateReadingActivityOnIssue = async (studentId: number) => {
  try {
    let activity = await prisma.readingActivity.findUnique({ where: { studentId } });
    if (!activity) {
      activity = await prisma.readingActivity.create({
        data: { studentId }
      });
    }
    
    await prisma.readingActivity.update({
      where: { studentId },
      data: {
        totalBooksBorrowed: { increment: 1 },
        monthlyReadingCount: { increment: 1 },
      }
    });
  } catch (err) {
    console.error('Failed to update reading activity on issue:', err);
  }
};

export const updateReadingActivityOnReturn = async (studentId: number) => {
  try {
    const activity = await prisma.readingActivity.findUnique({ where: { studentId } });
    if (activity) {
      const newReturned = activity.booksReturned + 1;
      let newBadges = activity.badges ? JSON.parse(activity.badges) : [];
      
      if (newReturned === 1 && !newBadges.includes('First Book')) newBadges.push('First Book');
      if (newReturned === 5 && !newBadges.includes('5 Books')) newBadges.push('5 Books');
      if (newReturned === 10 && !newBadges.includes('10 Books')) newBadges.push('10 Books');
      if (newReturned === 20 && !newBadges.includes('Consistent Reader')) newBadges.push('Consistent Reader');

      await prisma.readingActivity.update({
        where: { studentId },
        data: {
          booksReturned: newReturned,
          badges: JSON.stringify(newBadges),
          readingStreak: { increment: 1 }
        }
      });
    }
  } catch (err) {
    console.error('Failed to update reading activity on return:', err);
  }
};
