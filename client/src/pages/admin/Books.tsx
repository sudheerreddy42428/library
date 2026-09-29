import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit, Trash2, Download, Upload, Filter, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dropdown } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';

const initialBookState = {
  title: '',
  isbn: '',
  quantity: 1,
  categoryId: '',
  authorId: '',
  description: '',
  publisher: '',
  publicationYear: new Date().getFullYear(),
};

const Books: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const [bookData, setBookData] = useState<any>(initialBookState);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async () => {
    try {
      const res = await api.get(`/books?search=${search}`);
      setBooks(res.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book? This will fail if there are active loans.')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setBookData(initialBookState);
    setIsModalOpen(true);
  };

  const openEditModal = (book: any) => {
    setIsEditing(true);
    setCurrentBookId(book.id);
    setBookData({
      title: book.title,
      isbn: book.isbn,
      quantity: book.quantity,
      categoryId: book.categoryId,
      authorId: book.authorId,
      description: book.description || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || new Date().getFullYear(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && currentBookId) {
        await api.put(`/books/${currentBookId}`, bookData);
        toast.success('Book updated successfully');
      } else {
        // Need to provide valid integer authorId and categoryId. We'll fallback to 1 for this demo if not provided, 
        // since we haven't built category/author dropdowns yet, but we should safely convert.
        const payload = {
          ...bookData,
          authorId: Number(bookData.authorId) || 1,
          categoryId: Number(bookData.categoryId) || 1,
          quantity: Number(bookData.quantity),
          publicationYear: Number(bookData.publicationYear),
        };
        await api.post('/books', payload);
        toast.success('Book created successfully');
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Inventory</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage the library's book collection.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="pl-9 w-full"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Details</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-9 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                      <BookOpen className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No books found</p>
                      <p className="text-xs mt-1">Try adjusting your search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 bg-[var(--muted)] rounded object-cover flex-shrink-0 border border-[var(--border)] overflow-hidden flex items-center justify-center">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-[var(--muted-foreground)] opacity-50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] truncate" title={book.title}>{book.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5" title={book.author?.name || 'Unknown Author'}>
                            {book.author?.name || 'Unknown Author'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--muted-foreground)] text-sm font-mono">
                      {book.isbn}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[var(--foreground)]">
                        {book.category?.name || 'Uncategorized'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-[var(--foreground)]">{book.availableCopies}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/ {book.quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {book.availableCopies > 0 ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown 
                        items={[
                          { label: 'Edit Book', icon: Edit, onClick: () => openEditModal(book) },
                          { label: 'Delete Book', icon: Trash2, onClick: () => handleDelete(book.id), danger: true }
                        ]} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Book' : 'Add New Book'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
              <Input required value={bookData.title} onChange={e => setBookData({...bookData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">ISBN</label>
              <Input required value={bookData.isbn} onChange={e => setBookData({...bookData, isbn: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Author ID (Internal)</label>
              <Input type="number" required value={bookData.authorId} onChange={e => setBookData({...bookData, authorId: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Category ID (Internal)</label>
              <Input type="number" required value={bookData.categoryId} onChange={e => setBookData({...bookData, categoryId: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Total Quantity</label>
              <Input type="number" min="0" required value={bookData.quantity} onChange={e => setBookData({...bookData, quantity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Pub. Year</label>
              <Input type="number" required value={bookData.publicationYear} onChange={e => setBookData({...bookData, publicationYear: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Publisher</label>
              <Input value={bookData.publisher} onChange={e => setBookData({...bookData, publisher: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
            <textarea 
              className="w-full flex h-24 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
              value={bookData.description} 
              onChange={e => setBookData({...bookData, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Book'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Books;
