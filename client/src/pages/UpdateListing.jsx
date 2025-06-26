import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Upload, Image as ImageIcon, X, Plus, Home, MapPin, Bed, Bath, Car, Armchair, Tag, IndianRupee } from 'lucide-react';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 5000, // ✅ Changed from 50 to 5000
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);

  // Get Supabase user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();
  }, []);

  // ✅ Fetch listing data and pre-fill form
  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.id; // ✅ Changed from params.listingId to params.id
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/listing/get/${listingId}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          return;
        }
        setFormData(data); // ✅ Pre-fill form with existing data
      } catch (err) {
        console.error('Error fetching listing:', err);
      }
    };

    if (params.id) fetchListing();
  }, [params.id]);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  // ✅ Store image in Supabase Storage (instead of Firebase)
  const storeImage = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const fileName = `listings/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (uploadError) {
          reject(uploadError);
          return;
        }

        const { data: urlData } = await supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          resolve(urlData.publicUrl);
        } else {
          reject(new Error('Failed to get public URL'));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      
      setLoading(true);
      setError(false);
      
      // ✅ Get Supabase session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const userId = supabaseUser?.id; // ✅ Use Supabase user ID
      
      const res = await fetch(`/api/listing/update/${params.id}`, { // ✅ Changed from params.listingId
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`, // ✅ Add auth header
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userref: userId, // ✅ Use userref (lowercase) and Supabase user ID
        }),
      });
      
      const data = await res.json();
      setLoading(false);
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      navigate('/profile'); // ✅ Navigate back to profile instead of listing detail
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <main className='p-6 max-w-6xl mx-auto'>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center">
            <h1 className='text-4xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-3'>
              <Home size={40} />
              Update a Listing
            </h1>
            <p className="text-emerald-50 mt-2">Edit your property details</p>
          </div>

          <form onSubmit={handleSubmit} className='p-8'>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Property Details */}
              <div className='space-y-6'>
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                  <h2 className="text-2xl font-semibold text-emerald-800 mb-4 flex items-center">
                    <span className="mr-2">📝</span> Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-emerald-800 mb-2">Property Name</div>
                      <input
                        type='text'
                        placeholder='Name'
                        className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                        id='name'
                        maxLength='62'
                        minLength='10'
                        required
                        onChange={handleChange}
                        value={formData.name}
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-emerald-800 mb-2">Description</div>
                      <textarea
                        placeholder='Description'
                        className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70 h-32 resize-none'
                        id='description'
                        required
                        onChange={handleChange}
                        value={formData.description}
                      />
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-emerald-800 mb-2 flex items-center">
                        <MapPin className="mr-2" size={16} />
                        Address
                      </div>
                      <input
                        type='text'
                        placeholder='Address'
                        className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                        id='address'
                        required
                        onChange={handleChange}
                        value={formData.address}
                      />
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                  <h3 className="text-xl font-semibold text-cyan-800 mb-4 flex items-center">
                    <span className="mr-2">🏠</span> Property Type
                  </h3>
                  
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center p-4 bg-white/70 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all cursor-pointer'>
                      <input
                        type='checkbox'
                        id='sale'
                        className='w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 mr-3'
                        onChange={handleChange}
                        checked={formData.type === 'sale'}
                      />
                      <span className="font-medium text-cyan-800">Sell</span>
                    </div>
                    
                    <div className='flex items-center p-4 bg-white/70 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all cursor-pointer'>
                      <input
                        type='checkbox'
                        id='rent'
                        className='w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 mr-3'
                        onChange={handleChange}
                        checked={formData.type === 'rent'}
                      />
                      <span className="font-medium text-cyan-800">Rent</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
                  <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                    <span className="mr-2">✨</span> Features
                  </h3>
                  
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center p-4 bg-white/70 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer'>
                      <input
                        type='checkbox'
                        id='parking'
                        className='w-5 h-5 text-amber-600 rounded focus:ring-amber-500 mr-3'
                        onChange={handleChange}
                        checked={formData.parking}
                      />
                      <Car className="mr-2 text-amber-600" size={16} />
                      <span className="font-medium text-amber-800">Parking spot</span>
                    </div>
                    
                    <div className='flex items-center p-4 bg-white/70 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer'>
                      <input
                        type='checkbox'
                        id='furnished'
                        className='w-5 h-5 text-amber-600 rounded focus:ring-amber-500 mr-3'
                        onChange={handleChange}
                        checked={formData.furnished}
                      />
                      <Armchair className="mr-2 text-amber-600" size={16} />
                      <span className="font-medium text-amber-800">Furnished</span>
                    </div>
                    
                    <div className='flex items-center p-4 bg-white/70 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer col-span-2'>
                      <input
                        type='checkbox'
                        id='offer'
                        className='w-5 h-5 text-amber-600 rounded focus:ring-amber-500 mr-3'
                        onChange={handleChange}
                        checked={formData.offer}
                      />
                      <Tag className="mr-2 text-amber-600" size={16} />
                      <span className="font-medium text-amber-800">Offer</span>
                    </div>
                  </div>
                </div>

                {/* Rooms & Pricing */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-200">
                  <h3 className="text-xl font-semibold text-rose-800 mb-4 flex items-center">
                    <span className="mr-2">💰</span> Rooms & Pricing
                  </h3>
                  
                  <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className='text-center'>
                      <div className="text-rose-800 font-medium mb-2 flex items-center justify-center">
                        <Bed className="mr-2" size={16} />
                        Beds
                      </div>
                      <input
                        type='number'
                        id='bedrooms'
                        min='1'
                        max='10'
                        required
                        className='w-full p-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all bg-white/70 text-center text-lg font-semibold'
                        onChange={handleChange}
                        value={formData.bedrooms}
                      />
                    </div>
                    
                    <div className='text-center'>
                      <div className="text-rose-800 font-medium mb-2 flex items-center justify-center">
                        <Bath className="mr-2" size={16} />
                        Baths
                      </div>
                      <input
                        type='number'
                        id='bathrooms'
                        min='1'
                        max='10'
                        required
                        className='w-full p-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all bg-white/70 text-center text-lg font-semibold'
                        onChange={handleChange}
                        value={formData.bathrooms}
                      />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <div className="text-rose-800 font-medium mb-2 flex items-center">
                        <IndianRupee className="mr-2" size={16} />
                        Regular price
                        {formData.type === 'rent' && (
                          <span className='text-xs ml-2'>(₹ / month)</span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-600 font-bold text-lg">₹</span>
                        <input
                          type='number'
                          id='regularPrice'
                          min='5000'
                          max='10000000'
                          required
                          className='w-full pl-10 pr-4 py-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all bg-white/70 text-lg font-semibold'
                          onChange={handleChange}
                          value={formData.regularPrice}
                        />
                      </div>
                    </div>

                    {formData.offer && (
                      <div>
                        <div className="text-rose-800 font-medium mb-2 flex items-center">
                          <Tag className="mr-2" size={16} />
                          Discounted price
                          {formData.type === 'rent' && (
                            <span className='text-xs ml-2'>(₹ / month)</span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-600 font-bold text-lg">₹</span>
                          <input
                            type='number'
                            id='discountPrice'
                            min='0'
                            max='10000000'
                            required
                            className='w-full pl-10 pr-4 py-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all bg-white/70 text-lg font-semibold'
                            onChange={handleChange}
                            value={formData.discountPrice}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
                  <ImageIcon className="mr-2" size={24} />
                  Images
                </h3>
                <p className='text-purple-600 mb-6'>
                  The first image will be the cover (max 6)
                </p>
                
                <div className='space-y-4'>
                  <div className='flex gap-4'>
                    <input
                      onChange={(e) => setFiles(e.target.files)}
                      className='flex-1 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/70'
                      type='file'
                      id='images'
                      accept='image/*'
                      multiple
                    />
                    <button
                      type='button'
                      disabled={uploading}
                      onClick={handleImageSubmit}
                      className='px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 font-semibold shadow-lg flex items-center gap-2'
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                  
                  {imageUploadError && (
                    <p className='text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200'>
                      ❌ {imageUploadError}
                    </p>
                  )}
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {formData.imageUrls.length > 0 &&
                      formData.imageUrls.map((url, index) => (
                        <div
                          key={url}
                          className='flex justify-between items-center p-4 bg-white/70 rounded-xl border-2 border-purple-200 group hover:border-purple-400 transition-all'
                        >
                          <img
                            src={url}
                            alt='listing image'
                            className='w-20 h-20 object-cover rounded-lg shadow-md'
                          />
                          <button
                            type='button'
                            onClick={() => handleRemoveImage(index)}
                            className='p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100'
                          >
                            <X size={16} />
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                  
                  <button
                    disabled={loading || uploading}
                    className='w-full p-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 font-bold text-lg shadow-lg flex items-center justify-center gap-2'
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        Update listing
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <p className='text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200'>
                      ❌ {error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
