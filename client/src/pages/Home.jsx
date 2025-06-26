import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { Search, Home as HomeIcon, Heart, Star, MapPin, Users, Award, TrendingUp } from 'lucide-react';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, offers: 0, rent: 0, sale: 0 });

  SwiperCore.use([Navigation, Pagination, Autoplay, EffectFade]);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        setLoading(true);
        
        // Fetch offer listings
        const offerRes = await fetch('/api/listing/get?offer=true&limit=6');
        const offerData = await offerRes.json();
        const offers = Array.isArray(offerData) ? offerData : offerData.listings || [];
        setOfferListings(offers);

        // Fetch rent listings
        const rentRes = await fetch('/api/listing/get?type=rent&limit=6');
        const rentData = await rentRes.json();
        const rents = Array.isArray(rentData) ? rentData : rentData.listings || [];
        setRentListings(rents);

        // Fetch sale listings
        const saleRes = await fetch('/api/listing/get?type=sale&limit=6');
        const saleData = await saleRes.json();
        const sales = Array.isArray(saleData) ? saleData : saleData.listings || [];
        setSaleListings(sales);

        // Update stats
        setStats({
          total: offers.length + rents.length + sales.length,
          offers: offers.length,
          rent: rents.length,
          sale: sales.length
        });

      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100"></div>
        
        <div className='flex flex-col gap-8 py-20 px-6 max-w-6xl mx-auto relative z-10'>
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-emerald-200 mb-6">
              <Heart className="text-emerald-600 mr-2" size={20} />
              <span className="text-emerald-800 font-medium">Welcome to Your Dream Home Journey</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center">
            <h1 className='text-gray-800 font-bold text-4xl lg:text-7xl leading-tight mb-6'>
              Find Your Next
              <br />
              <span className='bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent'>
                Perfect Home
              </span>
              <br />
              <span className="text-3xl lg:text-5xl text-gray-600">With Ease</span>
            </h1>
            
            <div className='text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8'>
              🏡 <strong>Home Connect</strong> is your trusted companion in finding the perfect place to call home.
              <br />
              Discover a curated collection of beautiful properties that match your dreams.
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to={'/search'}
                className='bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2'
              >
                <Search size={20} />
                Start Your Search
              </Link>
              <Link
                to={'/about'}
                className='bg-white/80 backdrop-blur-sm text-emerald-700 px-8 py-4 rounded-2xl font-semibold hover:bg-white transition-all shadow-lg border border-emerald-200 flex items-center gap-2'
              >
                <HomeIcon size={20} />
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: HomeIcon, label: 'Total Properties', value: stats.total, color: 'emerald' },
              { icon: Heart, label: 'Special Offers', value: stats.offers, color: 'rose' },
              { icon: MapPin, label: 'For Rent', value: stats.rent, color: 'blue' },
              { icon: Award, label: 'For Sale', value: stats.sale, color: 'amber' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 text-center hover:shadow-xl transition-all">
                <stat.icon className={`w-8 h-8 text-${stat.color}-600 mx-auto mb-2`} />
                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}+</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties Slider */}
      {offerListings && offerListings.length > 0 && (
        <div className="relative mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">✨ Featured Properties</h2>
            <p className="text-gray-600">Handpicked homes with special offers just for you</p>
          </div>
          
          <Swiper
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            effect="fade"
            className="h-[60vh] rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto"
          >
            {offerListings.map((listing) => (
              <SwiperSlide key={listing.id}>
                <div className="relative h-full">
                  <div
                    style={{
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${listing.imageUrls?.[0]}) center no-repeat`,
                      backgroundSize: 'cover',
                    }}
                    className='h-full flex items-end'
                  >
                    <div className="bg-white/90 backdrop-blur-sm m-8 p-6 rounded-2xl shadow-xl max-w-md">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{listing.name}</h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={16} className="mr-2" />
                        <span>{listing.address}</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 mb-4">
                        ₹{(listing.discountPrice || listing.regularPrice).toLocaleString()}
                        {listing.type === 'rent' && <span className="text-lg text-gray-500">/month</span>}
                      </div>
                      <Link 
                        to={`/listing/${listing.id}`}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Listings Sections */}
      <div className='max-w-7xl mx-auto px-6 pb-20'>
        {/* Special Offers */}
        {offerListings && offerListings.length > 0 && (
          <div className='mb-16'>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
              <div className='flex justify-between items-center mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                      <Heart className="text-white" size={24} />
                    </div>
                    Special Offers
                  </h2>
                  <p className="text-gray-600 mt-2">Limited time deals on premium properties</p>
                </div>
                <Link 
                  className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg' 
                  to={'/search?offer=true'}
                >
                  View All Offers
                </Link>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {offerListings.slice(0, 3).map((listing) => (
                  <ListingItem listing={listing} key={listing.id} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* For Rent */}
        {rentListings && rentListings.length > 0 && (
          <div className='mb-16'>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200">
              <div className='flex justify-between items-center mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                      <HomeIcon className="text-white" size={24} />
                    </div>
                    Perfect Rentals
                  </h2>
                  <p className="text-gray-600 mt-2">Comfortable homes ready for you to move in</p>
                </div>
                <Link 
                  className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg' 
                  to={'/search?type=rent'}
                >
                  View All Rentals
                </Link>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {rentListings.slice(0, 3).map((listing) => (
                  <ListingItem listing={listing} key={listing.id} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* For Sale */}
        {saleListings && saleListings.length > 0 && (
          <div className='mb-16'>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
              <div className='flex justify-between items-center mb-8'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                      <Award className="text-white" size={24} />
                    </div>
                    Dream Homes for Sale
                  </h2>
                  <p className="text-gray-600 mt-2">Invest in your future with these premium properties</p>
                </div>
                <Link 
                  className='bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg' 
                  to={'/search?type=sale'}
                >
                  View All Properties
                </Link>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {saleListings.slice(0, 3).map((listing) => (
                  <ListingItem listing={listing} key={listing.id} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading beautiful homes for you...</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl mb-8 text-emerald-100">Join thousands of happy homeowners who found their perfect match</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/search" 
              className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
            >
              🔍 Start Searching Now
            </Link>
            <Link 
              to="/create-listing" 
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg border-2 border-white/20"
            >
              📝 List Your Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
