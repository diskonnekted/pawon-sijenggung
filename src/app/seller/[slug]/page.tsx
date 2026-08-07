import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Store, Package } from "lucide-react";

interface SellerData {
  _id: string;
  name: string;
  slug: string;
  logo: any;
  banner: any;
  address: string;
  description: string;
  isVerified: boolean;
  products?: string[];
  isActive?: boolean;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SellerDetailPage({ params }: Props) {
  const { slug } = await params;

  const seller: SellerData | null = await sanityFetch({
    query: `*[_type == "seller" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      logo,
      banner,
      rt,
      rw,
      "address": ("RT " + rt + " RW " + rw),
      description,
      products,
      isActive
    }`,
    params: { slug },
  }) as any;

  if (!seller || !seller.isActive) {
    notFound();
  }

  // Build fake product objects for the ProductCard
  const fakeProducts = (seller.products || []).map((name: string, i: number) => ({
    _id: `seller-product-${i}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    price: 10000,
    image: seller.logo,
    vendor: {
      _id: seller._id,
      name: seller.name,
      slug: seller.slug,
      phone: '',
    },
    stock: 10,
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Seller Header */}
      <header className="bg-white rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200/50 mb-16 relative overflow-hidden">
        {seller.banner && (
          <div className="absolute top-0 left-0 w-full h-48 opacity-10">
            <Image
              src={urlFor(seller.banner).width(1200).height(200).url()}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner bg-slate-50 flex-shrink-0">
            {seller.logo ? (
              <Image
                src={urlFor(seller.logo).width(400).height(400).url()}
                alt={seller.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-50">
                <Store className="w-16 h-16 text-green-600" />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                {seller.name}
              </h1>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-black text-sm">
                <BadgeCheck className="w-5 h-5" />
                TERVERIFIKASI
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 font-bold mb-6">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-green-600" />
                {seller.address}
              </div>
            </div>

            <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-3xl font-medium">
              {seller.description || `Toko UMKM di ${seller.address}. Tersedia ${seller.products?.length || 0} produk.`}
            </p>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      {fakeProducts.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-green-100 p-2 rounded-xl">
              <Package className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Produk</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {fakeProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {fakeProducts.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl text-center">Belum ada produk yang diunggah.</p>
        </div>
      )}
    </div>
  );
}
