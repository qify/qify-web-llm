/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
*/

// ===== Canvas 粒子背景动画 =====
const qfy_canvas = document.getElementById('qfy_bg');
const qfy_ctx = qfy_canvas.getContext('2d');
let qfy_particles = [];
let qfy_mouse = { x: null, y: null };
const qfy_PARTICLE_COUNT = 80;
const qfy_CONNECT_DIST = 130;

function qfy_resize() {
  qfy_canvas.width = window.innerWidth;
  qfy_canvas.height = window.innerHeight;
}

function qfy_createParticles() {
  qfy_particles = [];
  for (let qfy_i = 0; qfy_i < qfy_PARTICLE_COUNT; qfy_i++) {
    qfy_particles.push({
      x: Math.random() * qfy_canvas.width,
      y: Math.random() * qfy_canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1
    });
  }
}

function qfy_drawParticles() {
  qfy_ctx.clearRect(0, 0, qfy_canvas.width, qfy_canvas.height);

  for (let qfy_i = 0; qfy_i < qfy_particles.length; qfy_i++) {
    const qfy_p = qfy_particles[qfy_i];

    qfy_p.x += qfy_p.vx;
    qfy_p.y += qfy_p.vy;

    if (qfy_p.x < 0 || qfy_p.x > qfy_canvas.width) qfy_p.vx *= -1;
    if (qfy_p.y < 0 || qfy_p.y > qfy_canvas.height) qfy_p.vy *= -1;

    // 鼠标排斥效果
    if (qfy_mouse.x !== null) {
      const qfy_dx = qfy_p.x - qfy_mouse.x;
      const qfy_dy = qfy_p.y - qfy_mouse.y;
      const qfy_dist = Math.sqrt(qfy_dx * qfy_dx + qfy_dy * qfy_dy);
      if (qfy_dist < 100) {
        qfy_p.x += (qfy_dx / qfy_dist) * 1.5;
        qfy_p.y += (qfy_dy / qfy_dist) * 1.5;
      }
    }

    qfy_ctx.beginPath();
    qfy_ctx.arc(qfy_p.x, qfy_p.y, qfy_p.r, 0, Math.PI * 2);
    qfy_ctx.fillStyle = 'rgba(120, 180, 255, 0.85)';
    qfy_ctx.fill();
  }

  // 粒子连线
  for (let qfy_i = 0; qfy_i < qfy_particles.length; qfy_i++) {
    for (let qfy_j = qfy_i + 1; qfy_j < qfy_particles.length; qfy_j++) {
      const qfy_a = qfy_particles[qfy_i];
      const qfy_b = qfy_particles[qfy_j];
      const qfy_dx = qfy_a.x - qfy_b.x;
      const qfy_dy = qfy_a.y - qfy_b.y;
      const qfy_dist = Math.sqrt(qfy_dx * qfy_dx + qfy_dy * qfy_dy);

      if (qfy_dist < qfy_CONNECT_DIST) {
        qfy_ctx.beginPath();
        qfy_ctx.moveTo(qfy_a.x, qfy_a.y);
        qfy_ctx.lineTo(qfy_b.x, qfy_b.y);
        qfy_ctx.strokeStyle = 'rgba(120, 180, 255, ' + (0.25 * (1 - qfy_dist / qfy_CONNECT_DIST)) + ')';
        qfy_ctx.lineWidth = 1;
        qfy_ctx.stroke();
      }
    }
  }
}

function qfy_animate() {
  qfy_drawParticles();
  requestAnimationFrame(qfy_animate);
}

function qfy_initCanvas() {
  qfy_resize();
  qfy_createParticles();
  qfy_animate();
  window.addEventListener('resize', function () {
    qfy_resize();
    qfy_createParticles();
  });
  window.addEventListener('mousemove', function (qfy_e) {
    qfy_mouse.x = qfy_e.clientX;
    qfy_mouse.y = qfy_e.clientY;
  });
  window.addEventListener('mouseout', function () {
    qfy_mouse.x = null;
    qfy_mouse.y = null;
  });
}

qfy_initCanvas();

// ===== 健康检查：请求后端并输出到浏览器控制台（前端约定）=====
fetch('/api/health')
  .then(function (qfy_res) { return qfy_res.json(); })
  .then(function (qfy_data) { console.log('后端健康检查返回：', qfy_data); })
  .catch(function (qfy_err) { console.error('后端健康检查请求失败：', qfy_err); });
