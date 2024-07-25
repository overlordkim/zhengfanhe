# 使用 Node.js 的官方镜像作为基础镜像
FROM hub.uuuadc.top/library/node:20-alpine

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像源并替换阿里云的源，并且安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    echo "http://mirrors.aliyun.com/alpine/latest-stable/main/" > /etc/apk/repositories && \
    echo "http://mirrors.aliyun.com/alpine/latest-stable/community/" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache make gcc g++ python3 python3-dev py3-pip py3-setuptools py3-wheel vips vips-dev

# 设置 Python 环境变量，以便 node-gyp 使用
ENV PYTHON=python3

# 复制依赖定义文件
COPY package.json package-lock.json ./

# 安装 sharp 和其他依赖
RUN npm install sharp sqlite3 && npm install

# 复制所有源代码到容器
COPY . .

RUN chmod 755 /app/public/example.db && chown root:root /app/public/example.db

# 构建 Next.js 应用
RUN npm run build

# 暴露应用运行的端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "dev"]