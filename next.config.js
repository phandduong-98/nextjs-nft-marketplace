/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    loader: "imgix",
    path: "https://nextjsimage.imgix.net/",
},
}

module.exports = nextConfig
