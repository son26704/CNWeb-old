#!/bin/bash

# Tạo thư mục backend và các thư mục con
mkdir -p backend/src/{controllers,services,models,routes,middlewares,config,utils,tests}
touch backend/src/{app.js,main.ts}
mkdir -p backend/src/tests/env
touch backend/{env/package.json,tsconfig.json,README.md}

# Tạo thư mục frontend và các thư mục con
mkdir -p frontend/src/{api,components,pages,store,hooks,styles,utils,public}
touch frontend/src/{App.js,main.jsx}
mkdir -p frontend/src/public/env
touch frontend/{env/package.json,vite.config.js,README.md}

# Tạo các file cấp cao hơn nếu chưa có
touch {backend,frontend}/{package.json,README.md}

echo "Cấu trúc thư mục và file đã được tạo thành công!"