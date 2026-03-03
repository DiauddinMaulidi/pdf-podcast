import Login from "@/components/login/page"

const Home = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="sm:hidden h-screen flex items-center justify-center p-6">
        <div className="bg-[#cdcdcf] rounded-xl p-2 w-full max-w-sm shadow-xl text-center">
          <div className="bg-transparent justify-center items-center">
            <i className="font-bold text-[30px] text-amber-500">PDFPOD</i>
          </div>
          
          <img src="mobile.png" alt="Podcast Illustration" className="w-48 mx-auto mb-6"/>
          
          <h1 className="text-2xl font-semibold text-gray-800">
            Learn by Listening,<br />Not Reading
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Dengan bantuan AI, dokument PDF kamu kini bisa berubah<br /> menjadi podcast informatif dan interaktif.
          </p>
          <div className="mt-6">
            <Login />
          </div>
        </div>
      </div>

      <div className="hidden sm:flex relative min-h-screen items-center">

        <img
          src="qwerty.png"
          alt="Podcast"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl px-12 text-white">

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Learn by Listening,<br />Not Reading
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            Dengan bantuan AI, dokument PDF kamu kini bisa berubah<br /> menjadi podcast informatif dan interaktif.
          </p>

          <div className="mt-6">
            <Login />
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home
