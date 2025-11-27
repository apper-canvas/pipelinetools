import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import FilterPanel from '@/components/molecules/FilterPanel';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import QuoteModal from '@/components/organisms/QuoteModal';
import quotesService from '@/services/api/quotesService';
import contactsService from '@/services/api/contactsService';
import companiesService from '@/services/api/companiesService';

function QuotesList() {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    amountRange: ''
  });
  const [sortField, setSortField] = useState('CreatedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const statuses = ['Draft', 'Sent', 'Under Review', 'Accepted', 'Rejected', 'Expired'];
  const statusVariants = {
    'Draft': 'secondary',
    'Sent': 'info', 
    'Under Review': 'warning',
    'Accepted': 'success',
    'Rejected': 'error',
    'Expired': 'secondary'
  };

  useEffect(() => {
    loadQuotes();
    loadContacts();
    loadCompanies();
  }, []);

  useEffect(() => {
    filterAndSortQuotes();
  }, [quotes, searchQuery, filters, sortField, sortDirection]);

  async function loadQuotes() {
    try {
      setError(null);
      setLoading(true);
      const data = await quotesService.getAll();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes. Please try again.');
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    try {
      const data = await contactsService.getAll();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  async function loadCompanies() {
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

  function filterAndSortQuotes() {
    let filtered = [...quotes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        quote.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.QuoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.Description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(quote => quote.Status === filters.status);
    }

    // Apply amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter(quote => {
        switch (filters.amountRange) {
          case 'under5k': return quote.Amount < 5000;
          case '5k-20k': return quote.Amount >= 5000 && quote.Amount < 20000;
          case '20k-50k': return quote.Amount >= 20000 && quote.Amount < 50000;
          case 'over50k': return quote.Amount >= 50000;
          default: return true;
        }
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(quote => {
        const quoteDate = new Date(quote.CreatedDate);
        switch (filters.dateRange) {
          case 'today': 
            return quoteDate.toDateString() === now.toDateString();
          case 'thisWeek':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return quoteDate >= weekAgo;
          case 'thisMonth':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return quoteDate >= monthAgo;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'Amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField.includes('Date')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredQuotes(filtered);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handleEditQuote(quote) {
    setEditingQuote(quote);
    setShowModal(true);
  }

  async function handleDeleteQuote(quoteId) {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await quotesService.delete(quoteId);
      setQuotes(prev => prev.filter(q => q.Id !== quoteId));
      toast.success('Quote deleted successfully');
    } catch (err) {
      toast.error('Failed to delete quote');
    }
  }

  async function handleSaveQuote(quoteData) {
    try {
      let savedQuote;
      if (editingQuote) {
        savedQuote = await quotesService.update(editingQuote.Id, quoteData);
        setQuotes(prev => prev.map(q => q.Id === editingQuote.Id ? savedQuote : q));
        toast.success('Quote updated successfully');
      } else {
        savedQuote = await quotesService.create(quoteData);
        setQuotes(prev => [savedQuote, ...prev]);
        toast.success('Quote created successfully');
      }
      setShowModal(false);
      setEditingQuote(null);
    } catch (err) {
      toast.error(`Failed to ${editingQuote ? 'update' : 'create'} quote`);
    }
  }

  function handleAddQuote() {
    setEditingQuote(null);
    setShowModal(true);
  }

  function getContactName(contactId) {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.FirstName} ${contact.LastName}` : 'Unknown';
  }

  function getCompanyName(companyId) {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.Name : 'Unknown';
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function getStatusVariant(status) {
    return statusVariants[status] || 'secondary';
  }

  if (loading) return <Loading type="page" className="min-h-screen" />;
  if (error) return <ErrorView error={error} onRetry={loadQuotes} />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track your sales quotes
            </p>
          </div>
          <Button onClick={handleAddQuote} className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />
            New Quote
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search quotes..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableStatuses={statuses}
            customFilters={[
              {
                key: 'amountRange',
                label: 'Amount Range',
                type: 'select',
                options: [
                  { value: '', label: 'All Amounts' },
                  { value: 'under5k', label: 'Under $5K' },
                  { value: '5k-20k', label: '$5K - $20K' },
                  { value: '20k-50k', label: '$20K - $50K' },
                  { value: 'over50k', label: 'Over $50K' }
                ]
              },
              {
                key: 'dateRange',
                label: 'Date Range',
                type: 'select',
                options: [
                  { value: '', label: 'All Dates' },
                  { value: 'today', label: 'Today' },
                  { value: 'thisWeek', label: 'This Week' },
                  { value: 'thisMonth', label: 'This Month' }
                ]
              }
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <Empty
            title="No quotes found"
            description="Get started by creating your first quote"
            icon="FileText"
            actionLabel="Create Quote"
            onAction={handleAddQuote}
          />
        ) : (
          <div className="h-full overflow-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort('QuoteNumber')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Quote
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort('Title')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Title
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('Amount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Amount
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('CreatedDate')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Created
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote.Id}
                    className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.QuoteNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Valid until {format(new Date(quote.ValidUntil), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.Title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {getCompanyName(quote.CompanyId)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {getContactName(quote.ContactId)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(quote.Amount)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Badge variant={getStatusVariant(quote.Status)}>
                          {quote.Status}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <div className="text-xs text-gray-500">
                          {format(new Date(quote.CreatedDate), 'MMM d')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuote(quote)}
                            className="p-1"
                          >
                            <ApperIcon name="Edit2" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuote(quote.Id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <QuoteModal
          quote={editingQuote}
          contacts={contacts}
          companies={companies}
          onSave={handleSaveQuote}
          onClose={() => {
            setShowModal(false);
            setEditingQuote(null);
          }}
        />
      )}
    </div>
  );
}

export default QuotesList;