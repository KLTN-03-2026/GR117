import { useLocation } from "react-router-dom";


function DetailServices() {
    const location = useLocation();
    const { props } = location.state || [];
    { console.log(props) }
    return (
        <div className="relative h-72 md:h-[440px] overflow-hidden">
            {/* Imgae */}
            <img src={props.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
                <a href="" className="inline-flex items-center gap-1 text-white/70 hover:text-white mb-4 transition-colors"><span>Icon</span>Quay Lại</a>
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center gap-1">{props.description}</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center gap-1">3 ngày 2 đêm</span>
                        </div>
                        <h1 className="text-white">
                            {props.serviceName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80">
                            <span className="flex items-center gap-1">
                                <span>Icon</span>
                                {props.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <span>Icon</span>
                                Chưa Có Sao
                            </span>
                            <span className="flex items-center gap-1">
                                <span>Icon</span>
                                Bởi Công Ty {props.nameProvider}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0 hidden md:flex">
                        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            Icon Trái Tim
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            Icon Chia Sẽ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailServices;