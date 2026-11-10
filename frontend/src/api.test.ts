import { describe,it,expect,vi,afterEach } from 'vitest';
import { calculate } from './api';
afterEach(()=>vi.unstubAllGlobals());
describe('calculate API client',()=>{
  it('sends an operation and returns the result',async()=>{
    const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({operation:'add',result:7})});
    vi.stubGlobal('fetch',fetchMock);
    await expect(calculate('add',3,4)).resolves.toBe(7);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/calculate/add'),expect.objectContaining({method:'POST'}));
  });
  it('surfaces API validation errors',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'division by zero is not allowed'})}));
    await expect(calculate('divide',3,0)).rejects.toThrow('division by zero is not allowed');
  });
});
