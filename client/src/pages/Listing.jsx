import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/pagination';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaRupeeSign,
  FaCalendarAlt,
  FaHome,
  FaUser,
} from 'react-icons/fa';
import { supabase } from '../supabase';
import Contact from '../components/Contact';

export default function Listing() {
  SwiperCore.use([Navigation, Pagination, Autoplay]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [saved, setSaved] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  // Get Supabase user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // ✅ Changed from params.listingId to params.id
        const res = await fetch(`/api/listing/get/${params.id}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.id]); // ✅ Changed dependency

  const handleSave = () => {
    setSaved(!saved);
    // Add logic to save/unsave listing
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading beautiful property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-red-500 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600">We couldn't find this property. It might have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Image Slider */}
      <div className="relative">
        <Swiper
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-[60vh] md:h-[70vh]"
        >
          {listing.imageUrls?.map((url, index) => (
            <SwiperSlide key={url}>
              <div
                className="h-full relative"
                style={{
                  background: `url(${url}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <FaShare className="text-gray-700" />
          </button>
          <button
            onClick={handleSave}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            {saved ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-700" />}
          </button>
        </div>

        {copied && (
          <div className="fixed top-20 right-4 z-30 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            ✅ Link copied to clipboard!
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{listing.name}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FaMapMarkerAlt className="text-emerald-600 mr-2" />
                    <span>{listing.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600 flex items-center">
                    <FaRupeeSign className="text-2xl" />
                    {listing.offer
                      ? formatPrice(listing.discountPrice)
                      : formatPrice(listing.regularPrice)}
                  </div>
                  {listing.type === 'rent' && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
              </div>

              {/* Property Type & Offer */}
              <div className="flex gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-white font-semibold ${
                  listing.type === 'rent' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}>
                  <FaHome className="inline mr-2" />
                  {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                {listing.offer && (
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                    🎉 ₹{formatPrice(+listing.regularPrice - +listing.discountPrice)} OFF
                  </span>
                )}
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-200">
                  <FaBed className="text-2xl text-emerald-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {listing.bedrooms} {listing.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}
                  </div>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl text-center border border-cyan-200">
                  <FaBath className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {listing.bathrooms} {listing.bathrooms > 1 ? 'Bathrooms' : 'Bathroom'}
                  </div>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl text-center border border-teal-200">
                  <FaParking className="text-2xl text-teal-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {listing.parking ? 'Parking' : 'No Parking'}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                  <FaChair className="text-2xl text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                📝 Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {listing.description}
              </p>
            </div>

            {/* Additional Info */}
            {listing.created_at && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-emerald-600" /> Property Details
                </h2>
                <div className="text-gray-600">
                  <p><strong>Listed on:</strong> {new Date(listing.created_at).toLocaleDateString('en-IN')}</p>
                  <p><strong>Property ID:</strong> {listing.id}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Card */}
            {supabaseUser && listing.userref !== supabaseUser.id && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-200 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-2 text-emerald-600" /> Contact Owner
                </h3>
                {!contact ? (
                  <button
                    onClick={() => setContact(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                  >
                    💬 Send Message
                  </button>
                ) : (
                  <Contact listing={listing} />
                )}
              </div>
            )}

            {/* Property Highlights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">✨ Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  {listing.type === 'rent' ? 'Available for Rent' : 'Available for Purchase'}
                </div>
                {listing.parking && (
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    Dedicated Parking Space
                  </div>
                )}
                {listing.furnished && (
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    Fully Furnished
                  </div>
                )}
                {listing.offer && (
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Special Discount Available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
