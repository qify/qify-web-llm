/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
*/

// 健康检查接口
const qfy_getHealth = (req, res) => {
  res.json({
    code: 0,
    msg: '服务运行正常',
    data: {
      status: 'ok',
      time: new Date().toISOString()
    }
  });
};

module.exports = { qfy_getHealth };
