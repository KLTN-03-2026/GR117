const accounts = require("../models/account.js");
const bcrypt = require("bcrypt");
//chờ duyệt
module.exports.getPendingProviders = async (req, res) => {
  try {
    const providers = await accounts
      .find({ role: "provider", status: "pending" })
      .select("fullName email phone role status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách đối tác chờ duyệt thành công",
      data: providers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách provider pending:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
//phê duyệt 
module.exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Nhà cung cấp không tồn tại",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này không phải provider",
      });
    }

    if (provider.status === "active") {
      return res.status(400).json({
        message: "Nhà cung cấp đã được duyệt",
      });
    }

    provider.status = "active";
    await provider.save();

    return res.status(200).json({
      message: "Duyệt nhà cung cấp thành công",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi duyệt nhà cung cấp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
//từ chối lời đăng ký 
module.exports.rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await accounts.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Nhà cung cấp không tồn tại",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "Tài khoản này không phải provider",
      });
    }

    provider.status = "rejected";
    await provider.save();

    return res.status(200).json({
      message: "Từ chối nhà cung cấp thành công",
      data: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi từ chối nhà cung cấp:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

//láy tất cả tài khoản 
module.exports.getAllAccounts = async (req, res) => {
  try {
    const accountsList = await accounts.find().select("fullName email phone role status createdAt").sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Lấy danh sách tài khoản thành công",
      data: accountsList,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//thay đổi vai trò 
module.exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.body.role;

    if (!["user", "provider", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Vai trò không hợp lệ",
      });
    }
    const account = await accounts.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại",
      });
    }
    account.role = role;
    await account.save();
    return res.status(200).json({
      message: "Thay đổi vai trò thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
}

//xóa tài khoản 
module.exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const acconut = await accounts.findById(id);
    if (!acconut) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại"
      })
    }
    const deletedAccount = await accounts.findByIdAndDelete(id);
    return res.status(200).json({
      message: "xóa tài khoản thành công",
      data: deletedAccount,
    })
  } catch (erro) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
module.exports.lockAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const account = await accounts.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại"
      })
    }
    account.status = "locked";
    await account.save();
    return res.status(200).json({
      message: "Khóa tài khoản thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        status: account.status,
      },
    })
  } catch (error) {
    console.error("Lỗi khi khóa tài khoản:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
}

// mở khóa tài khoản 
module.exports.unlockAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const account = await accounts.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại"
      })
    }
    account.status = "active";
    await account.save();
    return res.status(200).json({
      message: "Mở khóa tài khoản thành công",
      data: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        status: account.status,
      },
    })
  } catch (error) {
    console.error("Lỗi khi mở khóa tài khoản:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
}

//thêm tài khoản mới 
module.exports.addAccount = async (req, res) => {

  //request gửi lên các thông cần thiết 
  const { fullName, email, phone, password, role } = req.body;

  try {
    const existAccount = await accounts.find({$or:[{ email }, { phone }, { fullName }]});
    if(existAccount){
      return res.status(400).json({ message: "Email, FullName,phone đã tồn tại" });
    }

    //check trường có thiếu hay ko
    if (!fullName || !email || !phone || !password || !role) {
    return res.status(400).json({ mesage: "thiếu thông tin bắt buộc " })
    }
    //check độ dài trường 
    if(fullName.length <5 || email.length <5 || fullName.length > 12 || email.length > 30 || phone.length < 10 || phone.length > 15  ){
      return res.status(400).json({ message: "FullName phải từ 5 đến 12 ký tự" });
    }    
    const hasdPassword = await bcrypt.hash(password,8);
    
    const newAccount = new accounts.create({
      fullName,
      email,
      phone,
      password :hasdPassword,
      role 
    })
    await newAccount.save();
    return res.status(201).json({
      message: "Thêm tài khoản thành công",
      data: newAccount,
    });
  } catch (error) {
    console.error("Lỗi khi thêm tài khoản:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
