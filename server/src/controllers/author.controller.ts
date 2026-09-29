import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAuthors = async (req: Request, res: Response) => {
  try {
    const authors = await prisma.author.findMany();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching authors' });
  }
};

export const createAuthor = async (req: Request, res: Response) => {
  try {
    const author = await prisma.author.create({ data: req.body });
    res.status(201).json(author);
  } catch (error) {
    res.status(500).json({ message: 'Error creating author' });
  }
};
