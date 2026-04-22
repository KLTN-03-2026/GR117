// //lấy thông tin
// const User = require("../models/User.js");
// const Provider = require("../models/Business.js");

// //post

// // lấy thông tin
// module.exports.getInfo = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const provider = await Provider.findById(id).populate(
//       "providerID",
//       "fullName email phone",
//     );

//     if (!provider) {
//       return res.status(404).json({
//         message: "Không tìm thấy provider",
//       });
//     }

//     res.status(200).json({
//       message: "Lấy thông tin thành công",
//       data: provider,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };
