// All API calls are intercepted. This test never writes to a real backend.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://localhost:8083';
const output = path.resolve(__dirname, '../test-results');
fs.mkdirSync(output, { recursive: true });
const p = { _id: '111111111111111111111111', name: 'Ghế thư giãn Mây', price: 2000000, discount: 10, stock: 8, status: 'APPROVED', category: 'Ghế', categoryId: '333333333333333333333333', description: 'Gỗ tự nhiên và vải dệt êm ái.', image: 'https://fixture.invalid/chair.png', rating: 4.8 };
const second = { ...p, _id: '222222222222222222222222', name: 'Đèn bàn An', price: 500000, category: 'Đèn', categoryId: '444444444444444444444444', discount: 0 };
const user = { _id: '555555555555555555555555', fullName: 'Khách kiểm thử', email: 'test@example.com', phone: '0901234567', role: 'USER' };
const post = { _id: '666666666666666666666666', userId: { ...user, _id: '777777777777777777777777', fullName: 'An Nhiên' }, description: 'Góc nhỏ bình yên của mình.', roomType: 'living_room', hashtags: ['japandi'], media: [{ type: 'image', url: p.image }], likeCount: 3, commentCount: 0, saved: false, createdAt: '2026-09-29T08:00:00Z' };
const board = { _id: '888888888888888888888888', title: 'Góc sống chậm', imageUrl: p.image, imageWidth: 600, imageHeight: 400, roomType: 'living_room', productPoints: [{ _id: 'point', productId: p._id, product: p, x: 50, y: 50 }] };
let orders = [], comments = [], favorites = [], refreshes = 0, createRequests = 0, failProducts = false, expire = false;
let browser, page;
(async () => {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
  page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [], unhandled = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://fixture.invalid/**', route => route.fulfill({ contentType: 'image/png', body: fs.readFileSync(path.resolve(__dirname, '../assets/home-room.png')) }));
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), endpoint = url.pathname.replace(/^\/api/, ''), method = req.method();
    const json = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }, body: JSON.stringify(value) });
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS' } });
    if (endpoint === '/auth/login') return req.postDataJSON().password === 'password123' ? json({ accessToken: 'access1', refreshToken: 'refresh1' }) : json({ message: 'Sai email hoặc mật khẩu.' }, 401);
    if (endpoint === '/auth/refresh') { refreshes++; expire = false; return json({ accessToken: 'access2', refreshToken: 'refresh2' }); }
    if (endpoint === '/users/me') return expire ? json({ message: 'Expired' }, 401) : json(user);
    if (endpoint === '/auth/register') return json({ emailSent: true }, 201);
    if (endpoint === '/auth/forgot-password' || endpoint === '/auth/resend-token' || endpoint === '/auth/reset-password') return json({ message: 'OK', emailSent: true });
    if (endpoint === '/products') return failProducts ? route.abort('failed') : json([p, second]);
    if (endpoint.startsWith('/products/')) return json(endpoint.endsWith(second._id) ? second : p);
    if (endpoint === '/categories') return json([{ id: p.categoryId, name: 'Ghế', isActive: true, children: [] }, { id: second.categoryId, name: 'Đèn', isActive: true, children: [] }]);
    if (endpoint === '/reviews') return json([]);
    if (endpoint === '/product-favorites/ids') return json(favorites);
    if (endpoint.startsWith('/product-favorites/')) { favorites = method === 'DELETE' ? [] : [p._id]; return json({ liked: method !== 'DELETE' }); }
    if (endpoint === '/promotions/validate') { assert.equal(req.postDataJSON().subtotal, 1800000); return json({ code: 'DECO10', discountAmount: 180000 }); }
    if (endpoint === '/orders' && method === 'POST') {
      createRequests++; const body = req.postDataJSON(); assert.equal(body.promotionCode, 'DECO10'); assert.deepEqual(body.items, [{ productId: p._id, quantity: 1 }]);
      const order = { ...body, _id: '999999999999999999999999', orderCode: 'DH-TEST', status: 'PENDING', paymentStatus: 'PENDING', totalAmount: 1620000, subtotal: 1800000, discountAmount: 180000, items: [{ productId: p._id, name: p.name, quantity: 1, unitPrice: 1800000, lineTotal: 1800000 }], createdAt: new Date().toISOString() };
      orders.push(order); return json(order, 201);
    }
    if (endpoint === '/orders/mine') return json(orders);
    if (endpoint === '/moodboards' || endpoint === '/product-spaces' || endpoint === '/moodboards/user/mine') return json([board]);
    if (endpoint === `/moodboards/${board._id}/products`) return json({ moodboardId: board._id, count: 1, items: [p] });
    if (endpoint.startsWith('/moodboards/') || endpoint.startsWith('/product-spaces/')) return json(board);
    if (endpoint === '/community/following') return json([]);
    if (endpoint === '/community/posts' || endpoint === '/community/feed' || endpoint === '/community/search') return json({ items: [post], total: 1, page: 1, totalPages: 1 });
    if (endpoint.endsWith('/comments')) { if (method === 'POST') { comments.push({ _id: 'comment1', userId: user, content: req.postDataJSON().content, createdAt: new Date().toISOString() }); post.commentCount++; return json(comments.at(-1), 201); } return json({ items: comments, total: comments.length, page: 1, totalPages: 1 }); }
    if (endpoint.endsWith('/save')) { post.saved = !post.saved; return json(post); }
    if (endpoint.endsWith('/react')) { post.myReaction = 'love'; post.likeCount++; return json(post); }
    if (endpoint === `/community/posts/${post._id}`) return json(post);
    if (endpoint === '/showrooms' || endpoint === '/support-tickets/mine') return json([]);
    unhandled.push(`${method} ${endpoint}`); return json({ message: 'Unhandled fixture endpoint' }, 500);
  });
  const go = async route => { await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 120000 }); };
  const button = name => page.getByRole('button', { name, exact: true });
  await go('/'); await page.getByText('Chạm cảm hứng.', { exact: false }).waitFor({ timeout: 120000 });
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  await page.screenshot({ path: path.join(output, 'home.png') });
  await go('/explore'); await page.getByRole('button', { name: p.name, exact: true }).waitFor();
  await page.getByLabel('Tìm sản phẩm', { exact: true }).fill('Đèn'); await page.getByRole('button', { name: second.name, exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: p.name, exact: true }).count(), 0);
  await page.getByLabel('Tìm sản phẩm', { exact: true }).fill('');
  await page.screenshot({ path: path.join(output, 'explore.png') });
  await page.getByRole('button', { name: p.name, exact: true }).click();
  await button('Thêm vào giỏ hàng').click(); await page.getByText('Đã thêm vào giỏ hàng.', { exact: true }).waitFor();
  await button('Xem giỏ hàng').click(); await button('Tiến hành đặt hàng').click();
  await page.getByLabel('Email', { exact: true }).fill(user.email); await page.getByLabel('Mật khẩu', { exact: true }).fill('wrongpass'); await button('Đăng nhập').click();
  await page.getByText('Sai email hoặc mật khẩu.', { exact: true }).waitFor();
  await page.getByLabel('Mật khẩu', { exact: true }).fill('password123'); await button('Đăng nhập').click();
  await button('Tiến hành đặt hàng').waitFor(); await button('Tiến hành đặt hàng').click();
  await page.getByLabel('Địa chỉ đầy đủ', { exact: false }).fill('123 Đường Hoa, Phường An, TP.HCM');
  await page.getByLabel('Mã giảm giá', { exact: true }).fill('DECO10'); await button('Áp dụng mã').click(); await page.getByText('Đã áp dụng mã DECO10.', { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, 'checkout.png') });
  await button('Xác nhận đặt hàng').click(); await page.getByText('DH-TEST', { exact: true }).waitFor(); assert.equal(createRequests, 1);
  await go('/cart'); await page.getByText('Giỏ hàng của bạn đang trống.', { exact: true }).waitFor();
  expire = true; await go('/account'); await page.getByText('Xin chào, Khách kiểm thử', { exact: true }).waitFor(); assert.equal(refreshes, 1);
  await go(`/products/${p._id}`); await button('Lưu vào yêu thích ♡').click(); await button('Đã yêu thích ♥').waitFor();
  await go('/favorites'); await page.getByRole('button', { name: p.name, exact: true }).waitFor();
  await go(`/boards/${board._id}`); await page.getByRole('button', { name: 'Xem sản phẩm 1', exact: true }).click(); await button('Thêm vào giỏ hàng').waitFor();
  await go('/community'); await page.getByText(post.description, { exact: true }).waitFor(); await page.screenshot({ path: path.join(output, 'community.png') });
  await go(`/community/${post._id}`); await page.getByLabel('Viết bình luận', { exact: true }).fill('Không gian thật ấm áp!'); await button('Gửi bình luận').click(); await page.getByText('Không gian thật ấm áp!', { exact: true }).waitFor();
  await go('/ai'); await page.getByText('Một bức ảnh.', { exact: false }).waitFor(); await page.screenshot({ path: path.join(output, 'ai.png') });
  failProducts = true; await go('/explore'); await page.getByText('Chưa kết nối được DECOHO.', { exact: false }).waitFor(); failProducts = false; await button('Thử lại').click(); await page.getByRole('button', { name: p.name, exact: true }).waitFor();
  assert.deepEqual(unhandled, [], 'Every API request must be mocked'); assert.deepEqual(errors, [], 'No runtime errors');
  fs.writeFileSync(path.join(output, 'smoke.json'), JSON.stringify({ passed: true, flows: ['home', 'search', 'product', 'guest cart', 'invalid login', 'login/cart merge', 'promotion', 'checkout', 'empty cart', 'refresh session', 'favorites', 'moodboard hotspot', 'community comment', 'AI screen', 'network error/retry'], createRequests, refreshes, errors }, null, 2));
  console.log('PASS: 15 customer flows; all API calls mocked. Screenshots in test-results.');
})().catch(async error => { console.error(error); if (page) { await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {}); fs.writeFileSync(path.join(output, 'failure.txt'), await page.locator('body').innerText().catch(() => '')); } process.exitCode = 1; }).finally(async () => { await browser?.close(); });
