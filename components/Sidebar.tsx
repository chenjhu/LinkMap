
import React, { useState, useMemo } from 'react';
import { Contact } from '../types';
import { X, Plus, User, Trash2, MapPin, Building2, ChevronDown } from 'lucide-react';

// 中国省市联动数据 (地级)
const CITY_DATA: Record<string, string[]> = {
  "北京市": ["北京市"],
  "天津市": ["天津市"],
  "河北省": ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"],
  "山西省": ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"],
  "内蒙古自治区": ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
  "辽宁省": ["沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市", "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市", "朝阳市", "葫芦岛市"],
  "吉林省": ["长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "松原市", "白城市", "延边朝鲜族自治州"],
  "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市", "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市", "黑河市", "绥化市", "大兴安岭地区"],
  "上海市": ["上海市"],
  "江苏省": ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"],
  "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"],
  "安徽省": ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"],
  "福建省": ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"],
  "江西省": ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"],
  "山东省": ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"],
  "河南省": ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市", "济源市"],
  "湖北省": ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市", "恩施土家族苗族自治州", "仙桃市", "潜江市", "天门市", "神农架林区"],
  "湖南省": ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市", "湘西土家族苗族自治州"],
  "广东省": ["广州市", "韶关市", "深圳市", "珠海市", "汕头市", "佛山市", "江门市", "湛江市", "茂名市", "肇庆市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"],
  "广西壮族自治区": ["南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市", "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市", "来宾市", "崇左市"],
  "海南省": ["海口市", "三亚市", "三沙市", "儋州市", "五指山市", "琼海市", "文昌市", "万宁市", "东方市", "定安县", "屯昌县", "澄迈县", "临高县", "白沙黎族自治县", "昌江黎族自治县", "乐东黎族自治县", "陵水黎族自治县", "保亭黎族苗族自治县", "琼中黎族苗族自治县"],
  "重庆市": ["重庆市"],
  "四川省": ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"],
  "贵州省": ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
  "云南省": ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "普洱市", "临沧市", "楚雄彝族自治州", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
  "西藏自治区": ["拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市", "阿里地区"],
  "陕西省": ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"],
  "甘肃省": ["兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市", "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市", "临夏回族自治州", "甘南藏族自治州"],
  "青海省": ["西宁市", "海东市", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
  "宁夏回族自治区": ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
  "新疆维吾尔自治区": ["乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区", "克孜勒苏柯尔克孜自治州", "喀什地区", "和田地区", "伊犁哈萨克自治州", "塔城地区", "阿勒泰地区", "石河子市", "阿拉尔市", "图木舒克市", "五家渠市", "铁门关市"],
  "香港特别行政区": ["香港岛", "九龙", "新界"],
  "澳门特别行政区": ["澳门半岛", "氹仔岛", "路环岛"],
  "台湾省": ["台北市", "新北市", "桃园市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "嘉义市"]
};

interface SidebarProps {
  provinceId: string | null;
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id' | 'addedAt'>) => void;
  onRemoveContact: (id: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  provinceId, 
  contacts, 
  onAddContact, 
  onRemoveContact,
  onClose 
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 获取当前选中省份对应的城市列表
  const availableCities = useMemo(() => {
    if (!provinceId) return [];
    return CITY_DATA[provinceId] || [];
  }, [provinceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddContact({ name, city: city.trim(), note });
    setName('');
    setCity('');
    setNote('');
    setIsAdding(false);
  };

  const isVisible = !!provinceId;

  return (
    <aside 
      className={`
        fixed top-0 right-0 h-full z-40
        w-full md:w-[430px]
        transition-transform duration-500 ease-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {isVisible && (
        <div className="flex h-full flex-col border-l border-white/60 bg-[rgba(248,249,251,0.78)] shadow-[-24px_0_60px_rgba(18,24,40,0.12)] backdrop-blur-[26px]">
          <div className="px-6 pb-5 pt-6 md:px-8 md:pb-6 md:pt-8 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#5b8def] rounded-[16px] flex items-center justify-center text-white shadow-[0_16px_30px_rgba(91,141,239,0.28)]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a9099]">Province</div>
                <h2 className="text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#1f2329] mt-1">{provinceId}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-white/80 rounded-full transition-colors duration-200">
              <X className="w-5 h-5 text-[#8a9099]" />
            </button>
          </div>

          <div className="px-6 py-6 md:px-8 overflow-y-auto flex-1 space-y-8">
            <section>
              {isAdding ? (
                <form onSubmit={handleSubmit} className="p-6 bg-white/78 rounded-[28px] border border-white/75 shadow-[0_18px_40px_rgba(18,24,40,0.08)] space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.18em] ml-1">联络人姓名</label>
                    <input 
                      autoFocus
                      placeholder="例如：王经理"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#f4f5f7] rounded-[18px] border border-black/5 outline-none focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15 transition-all text-sm text-[#1f2329]"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.18em] ml-1">所在城市</label>
                    <div className="relative group">
                      <select 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-4 py-3.5 pl-10 bg-[#f4f5f7] rounded-[18px] border border-black/5 outline-none focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15 transition-all text-sm appearance-none cursor-pointer text-[#1f2329]"
                      >
                        <option value="">选择城市...</option>
                        {availableCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9099]" />
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9099] pointer-events-none group-hover:text-[#1f2329] transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.18em] ml-1">详细备注</label>
                    <textarea 
                      placeholder="记录您的联络细节..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-[#f4f5f7] rounded-[18px] border border-black/5 outline-none focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15 resize-none transition-all text-sm text-[#1f2329]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-sm font-semibold text-[#8a9099] hover:text-[#1f2329] transition-colors">取消</button>
                    <button type="submit" className="flex-1 py-3 bg-[#1f2329] text-white rounded-[18px] text-sm font-semibold shadow-[0_14px_28px_rgba(18,24,40,0.18)] active:scale-[0.99] transition-all">保存联络人</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full py-4 bg-[#1f2329] text-white rounded-[22px] flex items-center justify-center gap-2 font-semibold hover:bg-black transition-all duration-200 active:scale-[0.99] shadow-[0_18px_30px_rgba(18,24,40,0.18)]"
                >
                  <Plus className="w-5 h-5" />
                  新增记录
                </button>
              )}
            </section>

            <section className="space-y-4">
              <div className="text-[10px] font-semibold text-[#8a9099] uppercase tracking-[0.22em] flex justify-between items-center">
                <span>联络名录 ({contacts.length})</span>
              </div>
              {contacts.length === 0 ? (
                <div className="py-16 text-center rounded-[28px] border border-white/70 bg-white/45">
                  <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(18,24,40,0.06)]">
                    <User className="w-8 h-8 text-[#d4d8de]" />
                  </div>
                  <p className="text-sm text-[#7d828c]">该地区暂无联络人记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <div key={contact.id} className="bg-white/76 p-5 rounded-[24px] border border-white/80 shadow-[0_16px_36px_rgba(18,24,40,0.08)] flex justify-between items-start group hover:translate-y-[-1px] hover:shadow-[0_20px_42px_rgba(18,24,40,0.10)] transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1f2329]">{contact.name}</span>
                          {contact.city && (
                            <span className="px-2.5 py-1 bg-[#eef3ff] text-[#5b8def] text-[10px] rounded-full font-semibold">
                              {contact.city}
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-[#70757f] mt-2 leading-relaxed whitespace-pre-wrap">{contact.note}</div>
                      </div>
                      <button 
                        onClick={() => {
                          if(confirm(`确定要删除 ${contact.name} 吗？`)) {
                            onRemoveContact(contact.id);
                          }
                        }} 
                        className="p-2 text-[#c7ccd3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </aside>
  );
};
