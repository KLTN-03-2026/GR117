import React from 'react'
import { IoSearch} from "react-icons/io5";
const ServiceManagement = () => {
  const [serviceSearch, setServiceSearch] = useState("");
  return (
      <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Quản lí dịch vụ 
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Tim kiem, loc va xu ly trang thai dich vu
                    </p>
                  </div>
    
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                      <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Tim theo ten, nha cung cap..."
                        className={`${inputClass} pl-11`}
                      />
                    </div>
    
                    <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                      <option>Tat ca trang thai</option>
                      <option>Cho duyet</option>
                      <option>Dang hien thi</option>
                      <option>Bi tu choi</option>
                      <option>Da an</option>
                    </select>
                  </div>
    
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">
                            Dich vu
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Nha cung cap
                          </th>
                          <th className="px-4 py-3 text-left font-medium">Gia</th>
                          <th className="px-4 py-3 text-left font-medium">
                            Danh gia
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Trang thai
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Thao tac
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-16 text-center text-slate-400"
                          >
                            Chua co du lieu dich vu
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  )
}

export default ServiceManagement