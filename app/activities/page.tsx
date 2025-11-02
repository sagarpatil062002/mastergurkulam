"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ChevronRight, ChevronLeft, X } from "lucide-react"
import type { Activity } from "@/lib/db-models"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string>("")
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data)
        const uniqueCategories = Array.from(new Set(data.map((a: Activity) => a.category)))
        setCategories(uniqueCategories as string[])
      })
      .catch(console.error)
  }, [])

  const filteredActivities =
    selectedCategory === "all" ? activities : activities.filter((a) => a.category === selectedCategory)

  const openLightbox = (images: string[], index: number) => {
    setLightboxImage(images[index])
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const navigateLightbox = (direction: "next" | "prev", images: string[]) => {
    let newIndex = lightboxIndex + (direction === "next" ? 1 : -1)
    if (newIndex < 0) newIndex = images.length - 1
    if (newIndex >= images.length) newIndex = 0
    setLightboxImage(images[newIndex])
    setLightboxIndex(newIndex)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">Our Activities</h1>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Explore our diverse range of academic, cultural, and sports activities that bring learning to life
          </p>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-primary">Activity Gallery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the vibrant life at Master's Gurukulam through our photo galleries
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === "all"
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              📸 All Activities
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {cat === "Academic" && "🎓"}
                {cat === "Cultural" && "🎭"}
                {cat === "Sports" && "⚽"}
                {cat === "Events" && "🎪"}
                {!["Academic", "Cultural", "Sports", "Events"].includes(cat) && "📂"}
                {" " + cat}
              </button>
            ))}
          </div>

          {/* Activities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity._id?.toString()}
                activity={activity}
                onImageClick={(images, index) => openLightbox(images, index)}
              />
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center text-muted-foreground py-12">No activities found</div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          image={lightboxImage}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => {
            const currentActivity = filteredActivities.find((a) => a.images.includes(lightboxImage))
            if (currentActivity) {
              navigateLightbox("prev", currentActivity.images)
            }
          }}
          onNext={() => {
            const currentActivity = filteredActivities.find((a) => a.images.includes(lightboxImage))
            if (currentActivity) {
              navigateLightbox("next", currentActivity.images)
            }
          }}
        />
      )}

      <Footer />
    </div>
  )
}

function ActivityCard({
  activity,
  onImageClick,
}: {
  activity: Activity
  onImageClick: (images: string[], index: number) => void
}) {
  const [imageIndex, setImageIndex] = useState(0)

  const goToNextImage = () => {
    setImageIndex((prev) => (prev + 1) % activity.images.length)
  }

  const goToPrevImage = () => {
    setImageIndex((prev) => (prev - 1 + activity.images.length) % activity.images.length)
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div
        className="relative h-72 bg-gradient-to-br from-primary/20 to-secondary/20 cursor-pointer group overflow-hidden"
        onClick={() => onImageClick(activity.images, imageIndex)}
      >
        {activity.images.length > 0 && (
          <img
            src={activity.images[imageIndex] || "/placeholder.svg"}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        {/* Image Counter */}
        {activity.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
            {imageIndex + 1}/{activity.images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {activity.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevImage()
              }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNextImage()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Click to view overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full font-semibold">
            👁️ Click to view
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-primary mb-2">{activity.title}</h3>
            <p className="text-lg text-secondary font-semibold mb-2">{activity.category}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground font-medium">
            📅 {new Date(activity.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activity.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Lightbox({
  image,
  onClose,
  onPrev,
  onNext,
}: {
  image: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all duration-300"
      >
        <X size={32} />
      </button>

      <img
        src={image || "/placeholder.svg"}
        alt="Activity"
        className="max-w-5xl max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />

      <button
        onClick={onPrev}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={40} />
      </button>

      <button
        onClick={onNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={40} />
      </button>

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-center">
        <p className="text-sm">Use arrow keys or click buttons to navigate • Press ESC to close</p>
      </div>
    </div>
  )
}
