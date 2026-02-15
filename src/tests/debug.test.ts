import { describe, it, expect } from 'vitest';
import { AlipayProvider } from '../providers/payment/alipay-provider';

describe('调试测试', () => {
    it('应该快速解析支付宝数据', async () => {
        const provider = new AlipayProvider();

        // 创建一个简单的测试数据
        const simpleData = `交易时间,交易分类,交易对方,对方账号,商品说明,收/支,金额,收/支方式,交易状态,交易订单号,商家订单号,备注
2023-02-12 21:32:14,消费充值,测试商户,/,话费卡,支出,49.74,交通银行信用卡(7449),交易成功,2023021200001,2023021200001,`;

        const mockFile = {
            name: 'test.csv',
            text: async () => simpleData
        } as File;

        console.log('开始解析...');
        const startTime = Date.now();

        try {
            // 先测试文件读取
            console.log('测试文件读取...');
            const fileData = await provider['readFileFromBlob'](mockFile);
            console.log('文件读取完成，表头:', fileData.headers);
            console.log('数据行数:', fileData.rows.length);

            // 再测试订单解析
            console.log('测试订单解析...');
            const orders = await provider['parseOrders'](fileData);
            console.log('订单解析完成，订单数:', orders.length);

            const result = { orders };

            const endTime = Date.now();
            console.log(`解析完成，耗时: ${endTime - startTime}ms`);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);
            expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
        } catch (error) {
            console.error('解析失败:', error);
            throw error;
        }
    }, 10000);
}); 