// npm run dev 前自动执行（package.json 的 predev 钩子）：
// 本机复用旧 .next 会在动态路由上连环崩渲染进程（Jest worker /
// Failed to generate static paths，详见 PROJECT.md 坑与注意事项），
// 所以每次启动都清掉 .next 强制冷启动，代价是每次多编译几秒。
import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true });
  console.log(".next 已清理（防缓存腐化，自动冷启动）");
} catch {
  console.warn(".next 清理失败（可能有服务器还开着），继续启动");
}
