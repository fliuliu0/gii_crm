# CRM 系统

一个基于 **React (前端)** 和 **Flask (后端)** 构建的 **客户关系管理 (CRM) 系统**，用于根据用户角色管理 **客户、销售机会和项目**。

## 功能特点

- **基于角色的访问权限**：管理员、销售和项目经理具有不同的权限。
- **身份验证**：使用基于 JWT 的身份验证系统确保安全的登录/登出。
- **客户管理**：查看、筛选和管理客户资料。
- **销售管理**：跟踪与客户相关的销售机会。
- **项目管理**：管理项目、资金状态及相关任务。
- **自动登出**：由于令牌到期，用户将在 **15 分钟** 后自动登出。

## 技术栈

- **前端**：React.js、React Bootstrap、Axios
- **后端**：Flask、Flask-JWT-Extended、SQLAlchemy
- **数据库**：MySQL

---

### 1️⃣ 克隆存储库

```sh
git clone https://github.com/fliuliu0/gii_crm.git
cd gii_crm
```

### 2️⃣ 后端设置

#### 安装依赖项

```sh
cd backend
python -m venv venv
source venv/bin/activate   # Windows 用户请使用 `venv\Scripts\activate`
pip install -r requirements.txt
```

#### 运行后端服务器

```sh
cd backend
python app.py
```

### 3️⃣ 前端设置

#### 安装依赖项

```sh
cd frontend
npm install
```

#### 启动前端

```sh
npm start
```

这将启动 **React 应用程序**（地址：`http://localhost:3000`）和 **Flask API**（地址：`http://127.0.0.1:5000`）。

---

## 默认登录凭据

### **管理员**

- **电子邮件**：[bob@example.com](mailto:bob@example.com)
- **密码**：password123

### **销售**

- **电子邮件**：[david@crmcompany.com](mailto:david@crmcompany.com)
- **密码**：password123

### **项目经理**

- **电子邮件**：[charlie@crmcompany.com](mailto:charlie@crmcompany.com)
- **密码**：password123

### **自动登出**

- 由于令牌到期，用户将在 **15 分钟** 后自动登出。

---

## 基于角色的访问权限

| 角色                  | 客户管理         | 销售管理       | 项目管理    | 资金管理     |
| ------------------- | ----------------- | ----------- | ----------- | ----------- |
| **管理员**          | ✅ 查看/编辑       | ✅ 查看/编辑 | ✅ 查看/编辑 | ✅ 查看/编辑 |
| **销售**            | ✅ 查看/编辑（自己的） | ✅ 查看/编辑 | ❌ 无访问权限 | ❌ 无访问权限 |
| **项目经理**        | ✅ 查看/编辑（自己的） | ❌ 无访问权限 | ✅ 查看/编辑 | ✅ 查看/编辑 |

---

## API 端点
http://127.0.0.1:5000/apidocs/#/


