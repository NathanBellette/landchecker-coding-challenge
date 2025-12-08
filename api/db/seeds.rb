puts "Seeding database..."

# Only clear data in development/test environments
if Rails.env.production?
  puts "WARNING: Seeds should not be run in production!"
  puts "Exiting to prevent data loss."
  exit 1
end

puts "Clearing existing data..."
[PropertyEvent, WatchList, PropertyImage, Property, User].each(&:destroy_all)

puts "Creating users..."
users = [
  { email: "bob.smith@example.com", password: "password123" },
  { email: "jane.citizen@example.com", password: "password123" },
  { email: "nathan.bellette@example.com", password: "password123" }
].map { |data| User.create!(data) }

puts "Created #{User.count} users"

puts "Creating 50 properties..."

australian_cities = [
  { name: "Melbourne", latitude: -37.8136, longitude: 144.9631 },
  { name: "Sydney", latitude: -33.8688, longitude: 151.2093 },
  { name: "Brisbane", latitude: -27.4698, longitude: 153.0251 },
  { name: "Perth", latitude: -31.9505, longitude: 115.8605 },
  { name: "Adelaide", latitude: -34.9285, longitude: 138.6007 }
]

property_types = %w[house apartment townhouse unit studio]
statuses = %w[available under_offer sold]

properties = []

50.times do |i|
  city = australian_cities.sample
  property_type = property_types.sample
  bedrooms = rand(1..5)
  status = statuses.sample

  latitude = city[:latitude] + rand(-0.1..0.1)
  longitude = city[:longitude] + rand(-0.1..0.1)

  property = Property.create!(
    title: Faker::Lorem.sentence(word_count: 6).gsub('.', ''),
    description: Faker::Lorem.paragraph(sentence_count: 3),
    price: rand(200_000..5_500_000).to_i,
    bedrooms: bedrooms,
    property_type: property_type,
    status: status,
    latitude: latitude,
    longitude: longitude,
    published_at: rand(1..30).days.ago
  )
  properties.push(property)
end

puts "Created #{properties.count} properties"

puts "Creating property images..."
image_urls = ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"]

properties.each_with_index do |property, index|
  # Skip every second property so some listings have no images
  next if index.odd?

  rand(2..5).times do |i|
    PropertyImage.create!(
      property: property,
      url: image_urls[0],
      position: i + 1
    )
  end
end

puts "Created #{PropertyImage.count} property images"

puts "Creating watch lists..."
users.each do |user|
  properties.sample(rand(2..5)).each do |property|
    WatchList.create!(user: user, property: property)
  end
end

puts "Created #{WatchList.count} watch list entries"

puts "Creating property events..."

properties.each do |property|
  rand(1..4).times do
    event_type = ["price_changed", "sold"].sample

    data = case event_type
    when "price_changed"
      { old_price: property.price + rand(-50_000..50_000), new_price: property.price }
    when "sold"
      { sold_price: property.price, sold_date: rand(1..30).days.ago.to_s }
    end

    PropertyEvent.create!(
      property: property,
      event_type: event_type,
      data: data,
      created_at: rand(1..30).days.ago
    )
  end
end

puts "Created #{PropertyEvent.count} property events"

puts "\n Seeding complete!"
puts "   Users: #{User.count}"
puts "   Properties: #{Property.count}"
puts "   Property Images: #{PropertyImage.count}"
puts "   Watch Lists: #{WatchList.count}"
puts "   Property Events: #{PropertyEvent.count}"
