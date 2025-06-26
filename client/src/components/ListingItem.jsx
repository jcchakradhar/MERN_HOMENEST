import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Car, Armchair, Tag, Heart } from 'lucide-react';
import { useState } from 'react';

export default function ListingItem({ listing }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';

  return (
    <div 
      className='bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl border border-emerald-100 group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/listing/${listing.id || listing._id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={
              !imageFailed && listing.imageUrls && listing.imageUrls[0] 
                ? listing.imageUrls[0] 
                : defaultImage
            }
            alt={listing.name || 'Property'}
            className='h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500'
            onError={() => setImageFailed(true)}
          />
          
          {/* Overlay with Property Type */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
              listing.type === 'rent' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}>
              {listing.type === 'rent' ? '🏡 For Rent' : '🏷️ For Sale'}
            </span>
          </div>

          {/* Offer Badge */}
          {listing.offer && (
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                <Tag className="inline w-3 h-3 mr-1" />
                OFFER
              </span>
            </div>
          )}

          {/* Heart Icon for Favorites */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all cursor-pointer">
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-5'>
          {/* Title */}
          <h3 className='text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors'>
            {listing.name || 'Beautiful Property'}
          </h3>

          {/* Address */}
          <div className='flex items-center gap-2 mb-3'>
            <MapPin className='w-4 h-4 text-emerald-600 flex-shrink-0' />
            <p className='text-sm text-gray-600 line-clamp-1'>
              {listing.address || 'Location not specified'}
            </p>
          </div>

          {/* Description */}
          <p className='text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed'>
            {listing.description || 'No description available'}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div className='flex items-baseline gap-1'>
              <span className="text-2xl font-bold text-emerald-600">
                ₹{listing.offer 
                  ? formatPrice(listing.discountPrice) 
                  : formatPrice(listing.regularPrice)}
              </span>
              {listing.type === 'rent' && (
                <span className="text-sm text-gray-500 font-medium">/month</span>
              )}
            </div>
            
            {listing.offer && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 line-through">
                  ₹{formatPrice(listing.regularPrice)}
                </span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  Save ₹{formatPrice(listing.regularPrice - listing.discountPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Property Features */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-4'>
              {/* Bedrooms */}
              <div className='flex items-center gap-1 text-gray-700'>
                <Bed className='w-4 h-4 text-emerald-600' />
                <span className="font-medium">
                  {listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}
                </span>
              </div>

              {/* Bathrooms */}
              <div className='flex items-center gap-1 text-gray-700'>
                <Bath className='w-4 h-4 text-cyan-600' />
                <span className="font-medium">
                  {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}
                </span>
              </div>
            </div>

            {/* Additional Features */}
            <div className="flex items-center gap-2">
              {listing.parking && (
                <div className="bg-emerald-50 p-1 rounded-full" title="Parking Available">
                  <Car className="w-3 h-3 text-emerald-600" />
                </div>
              )}
              {listing.furnished && (
                <div className="bg-blue-50 p-1 rounded-full" title="Furnished">
                  <Armchair className="w-3 h-3 text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Hover Effect - View Details */}
          <div className={`mt-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-2 rounded-lg font-semibold text-sm">
              👁️ View Details
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
