import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, SortAsc, MapPin, Home, Car, Armchair, Tag } from 'lucide-react';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      
      try {
        const res = await fetch(`/api/listing/get?${searchQuery}`);
        const data = await res.json();
        
        const listingsArray = Array.isArray(data) ? data : data.listings || [];
        const total = data.total || listingsArray.length;
        
        setShowMore(listingsArray.length > 8);
        setListings(listingsArray);
        setTotalResults(total);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    
    try {
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      const newListings = Array.isArray(data) ? data : data.listings || [];
      
      if (newListings.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...newListings]);
    } catch (error) {
      console.error('Error loading more listings:', error);
    }
  };

  const clearFilters = () => {
    setSidebardata({
      searchTerm: '',
      type: 'all',
      parking: false,
      furnished: false,
      offer: false,
      sort: 'created_at',
      order: 'desc',
    });
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
        {/* Sidebar - Search Filters */}
        <div className='lg:w-80 bg-white/80 backdrop-blur-sm border-r border-emerald-200 shadow-xl'>
          <div className="sticky top-0 p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <Filter className="mr-3 text-emerald-600" size={24} />
                Search Filters
              </h2>
              <p className="text-gray-600 text-sm">Find your perfect property</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Search Term */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <label className='text-sm font-semibold text-emerald-800 mb-2 flex items-center'>
                  <SearchIcon className="mr-2" size={16} />
                  Search Term
                </label>
                <input
                  type='text'
                  id='searchTerm'
                  placeholder='Search properties...'
                  className='w-full border-2 border-emerald-200 rounded-lg p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                  value={sidebardata.searchTerm}
                  onChange={handleChange}
                />
              </div>

              {/* Property Type */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200">
                <div className='text-sm font-semibold text-cyan-800 mb-3 flex items-center'>
                  <Home className="mr-2" size={16} />
                  Property Type
                </div>
                <div className='space-y-3'>
                  {[
                    { id: 'all', label: '🏠 Rent & Sale', checked: sidebardata.type === 'all' },
                    { id: 'rent', label: '🏡 For Rent', checked: sidebardata.type === 'rent' },
                    { id: 'sale', label: '🏷️ For Sale', checked: sidebardata.type === 'sale' }
                  ].map((option) => (
                    <div key={option.id} className='flex items-center p-3 bg-white/70 rounded-lg border-2 border-cyan-200 hover:border-cyan-400 transition-all cursor-pointer'>
                      <input
                        type='checkbox'
                        id={option.id}
                        className='w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 mr-3'
                        onChange={handleChange}
                        checked={option.checked}
                      />
                      <span className="font-medium text-cyan-800">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <div className='text-sm font-semibold text-amber-800 mb-3 flex items-center'>
                  <Tag className="mr-2" size={16} />
                  Special Features
                </div>
                <div className='flex items-center p-3 bg-white/70 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer'>
                  <input
                    type='checkbox'
                    id='offer'
                    className='w-4 h-4 text-amber-600 rounded focus:ring-amber-500 mr-3'
                    onChange={handleChange}
                    checked={sidebardata.offer}
                  />
                  <span className="font-medium text-amber-800">🎉 Special Offers</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                <div className='text-sm font-semibold text-rose-800 mb-3 flex items-center'>
                  <MapPin className="mr-2" size={16} />
                  Amenities
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center p-3 bg-white/70 rounded-lg border-2 border-rose-200 hover:border-rose-400 transition-all cursor-pointer'>
                    <input
                      type='checkbox'
                      id='parking'
                      className='w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mr-3'
                      onChange={handleChange}
                      checked={sidebardata.parking}
                    />
                    <Car className="mr-2 text-rose-600" size={16} />
                    <span className="font-medium text-rose-800">Parking Available</span>
                  </div>
                  <div className='flex items-center p-3 bg-white/70 rounded-lg border-2 border-rose-200 hover:border-rose-400 transition-all cursor-pointer'>
                    <input
                      type='checkbox'
                      id='furnished'
                      className='w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mr-3'
                      onChange={handleChange}
                      checked={sidebardata.furnished}
                    />
                    <Armchair className="mr-2 text-rose-600" size={16} />
                    <span className="font-medium text-rose-800">Fully Furnished</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                <div className='text-sm font-semibold text-purple-800 mb-3 flex items-center'>
                  <SortAsc className="mr-2" size={16} />
                  Sort Results
                </div>
                <select
                  onChange={handleChange}
                  value={`${sidebardata.sort}_${sidebardata.order}`}
                  id='sort_order'
                  className='w-full border-2 border-purple-200 rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/70'
                >
                  <option value='regularPrice_desc'>💰 Price: High to Low</option>
                  <option value='regularPrice_asc'>💰 Price: Low to High</option>
                  <option value='created_at_desc'>🆕 Latest First</option>
                  <option value='created_at_asc'>📅 Oldest First</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="submit"
                  className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg'
                >
                  🔍 Search Properties
                </button>
                <button 
                  type="button"
                  onClick={clearFilters}
                  className='w-full bg-gray-500 text-white p-3 rounded-xl font-semibold hover:bg-gray-600 transition-all'
                >
                  🗑️ Clear Filters
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Main Content - Results */}
        <div className='flex-1 bg-white/60 backdrop-blur-sm'>
          {/* Results Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h1 className='text-3xl font-bold text-gray-800 flex items-center'>
                  <Home className="mr-3 text-emerald-600" size={32} />
                  Property Results
                </h1>
                {totalResults > 0 && (
                  <p className="text-gray-600 mt-1">
                    Found {totalResults} {totalResults === 1 ? 'property' : 'properties'}
                  </p>
                )}
              </div>
              {sidebardata.searchTerm && (
                <div className="bg-emerald-100 px-4 py-2 rounded-lg">
                  <span className="text-emerald-800 font-medium">
                    Searching: "{sidebardata.searchTerm}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className='p-6'>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className='text-xl text-gray-600'>Searching properties...</p>
                </div>
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {!loading && listings.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {listings.map((listing) => (
                  <ListingItem key={listing.id || listing._id} listing={listing} />
                ))}
              </div>
            )}

            {showMore && (
              <div className="text-center mt-8">
                <button
                  onClick={onShowMoreClick}
                  className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg'
                >
                  📄 Load More Properties
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
