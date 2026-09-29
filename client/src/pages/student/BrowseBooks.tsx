import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, BookOpen, Filter, Star, Info, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useCart, Book } from '../../context/CartContext';

const BrowseBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, removeFromCart, isInCart } = useCart();

  const fetchBooks = async () => {
    try {
      const res = await api.get(`/books?search=${search}`);
      setBooks(res.data);
    } catch (error) {
      console.error('Failed to fetch books');
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Library Catalog</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">
            Search our extensive collection of books, journals, and resources. Discover your next great read.
          </p>
        </div>
        <div className="hidden sm:block p-4 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 rounded-xl">
          <BookOpen className="h-8 w-8 text-[var(--color-primary-500)]" />
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
          <Input
            className="pl-12 py-6 text-lg w-full bg-[var(--card)] shadow-sm rounded-xl border-[var(--border)]"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl shrink-0 w-full sm:w-auto bg-[var(--card)]">
          <Filter className="mr-2 h-5 w-5 text-[var(--muted-foreground)]" />
          Filters
        </Button>
      </div>

      {/* Results Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-sm">
                <Skeleton className="h-64 w-full rounded-none" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card)] rounded-xl border border-[var(--border)] border-dashed">
            <BookOpen className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-20 mb-4" />
            <h3 className="text-lg font-medium text-[var(--foreground)]">No books found</h3>
            <p className="text-[var(--muted-foreground)] mt-1">Try adjusting your search query or removing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => {
              const inCart = isInCart(book.id);
              
              return (
              <Card key={book.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all border-[var(--border)]">
                <div className="relative h-64 bg-[var(--muted)] flex items-center justify-center overflow-hidden">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--muted-foreground)]/40">
                      <BookOpen className="h-12 w-12 mb-2" />
                      <span className="text-xs uppercase tracking-widest font-semibold">No Cover</span>
                    </div>
                  )}
                  {/* Rating placeholder */}
                </div>
                
                <CardContent className="p-5 flex-1 flex flex-col bg-[var(--card)]">
                  <div className="mb-2">
                    <h3 className="font-bold text-[var(--foreground)] text-lg line-clamp-1 leading-tight group-hover:text-[var(--color-primary-600)] transition-colors" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-1">{book.author?.name || 'Unknown Author'}</p>
                  </div>
                  
                  <div className="text-xs text-[var(--muted-foreground)] mb-4">
                    {book.category?.name || 'General'}
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] flex-wrap">
                    <Badge variant={book.availableCopies > 0 ? "success" : "secondary"} className="text-[10px] px-2 py-0.5">
                      {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
                    </Badge>
                    
                    <div className="flex gap-2 w-full mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 flex-1"
                        onClick={() => {
                          // TODO: Modal details
                        }}
                      >
                        <Info className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      
                      {book.availableCopies > 0 && (
                        <Button
                          variant={inCart ? "secondary" : "default"}
                          size="sm"
                          className="h-8 flex-1"
                          onClick={() => {
                            if (inCart) {
                              removeFromCart(book.id);
                            } else {
                              addToCart(book);
                            }
                          }}
                        >
                          {inCart ? (
                            <><Minus className="mr-1.5 h-3.5 w-3.5" /> Remove</>
                          ) : (
                            <><ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseBooks;
