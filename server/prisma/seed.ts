import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a Librarian Account (Admin)
  const hashedAdminPassword = await bcrypt.hash('librarian123', 10);
  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@smartlib.com' },
    update: {},
    create: {
      email: 'librarian@smartlib.com',
      password: hashedAdminPassword,
      name: 'Admin Librarian',
      role: 'ADMIN',
    },
  });
  console.log(`Created Librarian: ${librarian.email}`);

  // 2. Create a Student Account
  const hashedStudentPassword = await bcrypt.hash('student123', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@smartlib.com' },
    update: {},
    create: {
      email: 'student@smartlib.com',
      password: hashedStudentPassword,
      name: 'John Doe',
      role: 'STUDENT',
      student: {
        create: {
          studentId: 'STU1001',
          department: 'Computer Science',
          year: '2026',
        }
      }
    },
  });
  console.log(`Created Student: ${studentUser.email}`);

  // 3. Create Authors
  const authorsData = [
    { name: 'J.K. Rowling', bio: 'British author, best known for the Harry Potter series.' },
    { name: 'George Orwell', bio: 'English novelist, essayist, journalist, and critic.' },
    { name: 'Robert C. Martin', bio: 'Software engineer and author.' },
    { name: 'Martin Fowler', bio: 'Software developer and author.' },
    { name: 'Isaac Asimov', bio: 'American writer and professor of biochemistry.' }
  ];

  const authors = {};
  for (const data of authorsData) {
    const author = await prisma.author.create({ data });
    authors[data.name] = author.id;
  }
  console.log('Created Authors');

  // 4. Create Categories
  const categoriesData = [
    'Fiction', 'Science Fiction', 'Programming', 'Software Engineering', 'Fantasy'
  ];

  const categories = {};
  for (const name of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category.id;
  }
  console.log('Created Categories');

  // 5. Create Books
  const booksData = [
    {
      isbn: '9780590353403',
      title: 'Harry Potter and the Sorcerer\'s Stone',
      description: 'A young boy discovers he is a wizard and attends a magical school.',
      publisher: 'Scholastic',
      publicationYear: 1998,
      quantity: 5,
      availableCopies: 5,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780590353403-M.jpg',
      authorId: authors['J.K. Rowling'],
      categoryId: categories['Fantasy']
    },
    {
      isbn: '9780451524935',
      title: '1984',
      description: 'A dystopian social science fiction novel and cautionary tale.',
      publisher: 'Signet Classic',
      publicationYear: 1961,
      quantity: 3,
      availableCopies: 3,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
      authorId: authors['George Orwell'],
      categoryId: categories['Science Fiction']
    },
    {
      isbn: '9780132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      quantity: 2,
      availableCopies: 2,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg',
      authorId: authors['Robert C. Martin'],
      categoryId: categories['Programming']
    },
    {
      isbn: '9780201485677',
      title: 'Refactoring: Improving the Design of Existing Code',
      description: 'As the application of object technology expands, code starts to degrade.',
      publisher: 'Addison-Wesley',
      publicationYear: 1999,
      quantity: 4,
      availableCopies: 4,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780201485677-M.jpg',
      authorId: authors['Martin Fowler'],
      categoryId: categories['Software Engineering']
    },
    {
      isbn: '9780553293357',
      title: 'Foundation',
      description: 'The first novel in Isaac Asimov\'s Foundation Series.',
      publisher: 'Bantam Books',
      publicationYear: 1991,
      quantity: 6,
      availableCopies: 6,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780553293357-M.jpg',
      authorId: authors['Isaac Asimov'],
      categoryId: categories['Science Fiction']
    }
  ];

  for (const data of booksData) {
    await prisma.book.upsert({
      where: { isbn: data.isbn },
      update: {},
      create: data,
    });
  }
  console.log('Created Books');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
