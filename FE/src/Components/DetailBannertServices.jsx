function DetailBannerService({ imageUrl = "",
    serviceName = "",
    location = "",
    nameProvider = "",
}) {
    return (
        <div className="relative h-72 md:h-[440px] overflow-hidden">
            <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
                <a href="/destination" className="text-white/70 hover:text-white mb-4 block">
                    ← Quay Lại
                </a>

                <h1 className="text-white text-2xl font-bold">
                    {serviceName}
                </h1>

                <div className="text-white/80 mt-2">
                    {location} • Bởi {nameProvider}
                </div>
            </div>
        </div>
    );
}

export default DetailBannerService;