import { Request, Response } from 'express';
import prisma from '../prisma';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const { search, category, author } = req.query;
    let whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { isbn: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (category) whereClause.categoryId = Number(category);
    if (author) whereClause.authorId = Number(author);

    const books = await prisma.book.findMany({
      where: whereClause,
      include: { author: true, category: true },
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: true, category: true }
    });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const existing = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (existing) return res.status(400).json({ message: 'ISBN already exists' });
    if (data.quantity < 0) return res.status(400).json({ message: 'Quantity cannot be negative' });

    data.availableCopies = data.quantity;
    
    const book = await prisma.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        publisher: data.publisher,
        edition: data.edition,
        publicationYear: Number(data.publicationYear),
        quantity: Number(data.quantity),
        availableCopies: Number(data.quantity),
        authorId: Number(data.authorId),
        categoryId: Number(data.categoryId),
        block: data.block,
        floor: data.floor,
        section: data.section,
        shelf: data.shelf,
        row: data.row,
        rack: data.rack
      }
    });
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating book' });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = Number(req.params.id);
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Book not found' });

    // Ensure quantity changes reflect in available copies correctly
    let availableCopies = existing.availableCopies;
    if (data.quantity !== undefined && data.quantity !== existing.quantity) {
      const diff = data.quantity - existing.quantity;
      availableCopies = existing.availableCopies + diff;
      if (availableCopies < 0) return res.status(400).json({ message: 'Cannot reduce quantity below currently issued copies' });
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...data,
        quantity: data.quantity !== undefined ? Number(data.quantity) : existing.quantity,
        availableCopies,
      }
    });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book' });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book (might be tied to issues)' });
  }
};
