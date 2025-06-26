import React from 'react';
import { Heart, Users, Award, Shield, Home, Star, MapPin, Phone, Mail } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Homes',
      description: 'We believe every family deserves a place they can truly call home. Your dreams are our mission.',
      color: 'rose'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Complete honesty in every transaction. No hidden fees, no surprises - just genuine service.',
      color: 'emerald'
    },
    {
      icon: Users,
      title: 'Personal Touch',
      description: 'Every client is family to us. We take time to understand your unique needs and preferences.',
      color: 'blue'
    },
    {
      icon: Award,
      title: 'Excellence Always',
      description: 'From first meeting to keys in hand, we deliver exceptional service that exceeds expectations.',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center text-white">
          <div className="mb-6">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
              <Heart className="text-white mr-2" size={20} />
              <span className="font-medium">Our Story</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            About
            <br />
            <span className="text-emerald-100">Home Connect</span>
          </h1>
          <p className="text-xl lg:text-2xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            Where dreams meet reality, and houses become homes. 
            We're not just a real estate platform - we're your partners in life's biggest moments.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-emerald-200">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                🏡 Making Home Dreams Come True
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At <strong>Home Connect</strong>, we believe that finding the perfect home shouldn't be stressful or overwhelming. 
                We're here to transform your property journey into an exciting adventure filled with possibilities.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Whether you're a first-time buyer taking that brave first step, a growing family needing more space, 
                or an investor looking for the next great opportunity - we're here to guide you with expertise, 
                care, and genuine enthusiasm.
              </p>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                <p className="text-emerald-800 font-medium italic">
                  "We don't just sell properties; we help families find their sanctuary, 
                  their safe haven, their place to create beautiful memories."
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Beautiful home"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <Heart className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Your Dream Home</div>
                    <div className="text-sm text-gray-600">Awaits You</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Makes Us Different</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our values aren't just words on a wall - they're the foundation of every interaction we have
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all group">
              <div className={`bg-gradient-to-r from-${value.color}-500 to-${value.color}-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                <value.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{value.title}</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Let's find that perfect place where your story begins. Your dream home is just one conversation away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a 
              href="/search" 
              className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg inline-flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Browse Properties
            </a>
            <a 
              href="/contact" 
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg border-2 border-white/20 inline-flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Talk to an Expert
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-emerald-100">
            <div className="flex items-center gap-2">
              <Phone size={18} />
              <span>+91 9346154957</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
