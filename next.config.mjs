/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['ahooks','@acme/ui', 'lodash-es','antd','rc-util','@ant-design','rc-pagination','rc-picker'],
};

export default nextConfig;
