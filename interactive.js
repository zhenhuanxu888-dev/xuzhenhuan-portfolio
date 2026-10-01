(() => {
  const demos = {
    onboarding: {
      file: 'tianyan-onboarding', title: '完成你的第一次桌面任务', poster: 'tianyan-onboarding',
      intro: '从场景选择、示例指令到新手任务，实际体验一条首次使用路径。',
      entries: [
        ['welcome', '完整新手路径', '点击「开始」进入产品引导，跟随提示了解工作区与任务入口。'],
        ['scene', '场景与示例', '选择一个工作场景，确认后体验使用提示与示例任务。'],
        ['task', '新手任务清单', '查看任务清单，试试示例指令与右下角的使用技巧。']
      ]
    },
    team: {
      file: 'tianyan-team', title: '让一项任务在团队中接力', poster: 'tianyan-hitl',
      intro: '带着项目上下文进入节点，查看结果，再决定提交审核还是继续修改。',
      entries: [
        ['room', '节点协作与审核', '在右侧查看上下文和产出；试着提交当前节点，再进入审核流程。'],
        ['flow', '任务接力', '查看节点状态与负责人，点击已解锁节点，观察上一棒的交接信息。'],
        ['knowledge', '知识与权限', '切换知识库目录，查看文件可见范围；再从左侧进入项目与成员管理。']
      ]
    },
    xinghe: {
      file: 'xinghe', title: '从营销目标到可编辑的内容', poster: 'xinghe-overview',
      intro: '可以顺着六个阶段体验，也可以直接进入品牌资料、策略比较或发布预览。',
      entries: [
        ['intent', '任务创建', '输入营销目标、选择渠道与内容形式，点击下一步进入洞察。'],
        ['brand', '品牌资料', '切换人设、产品、案例与品牌词库，查看持续创作所需的品牌上下文。'],
        ['insight', '洞察依据', '打开洞察卡片，查看案例、热点与品牌匹配信息，再进入策略选择。'],
        ['strategy', '策略与生成', '比较策略、调整生成参数，确认后查看模拟生成过程。'],
        ['edit', '人工优化', '直接编辑初稿，或通过对话提出修改要求，再进入发布预览。'],
        ['publish', '发布预览', '选择渠道、时间并查看预览。这里仅演示流程，不会真实发布。']
      ]
    }
  };

  document.querySelectorAll('[data-prototype]').forEach(host => {
    const config = demos[host.dataset.prototype];
    if (!config) return;
    let selected = 0, frame = null, timer, oldOverflow, placeholder;
    let fit = innerWidth <= 700;
    host.classList.add('prototype');
    host.innerHTML = `<div class="prototype-tabs" role="group" aria-label="选择体验片段">${config.entries.map((entry, index) => `<button type="button" aria-pressed="${index === 0}" data-entry="${index}">${entry[1]}</button>`).join('')}</div>
      <div class="prototype-note"><p></p><span class="prototype-count"></span></div>
      <div class="prototype-tools"><small>交互原型 · 示例数据 · 不连接真实业务</small><button type="button" data-fit disabled>查看全貌</button><button type="button" data-reset disabled>重新开始</button><button type="button" data-expand>展开体验 ↗</button><a data-open target="_blank" rel="noopener">独立窗口 ↗</a></div>
      <div class="prototype-scroll"><div class="prototype-cover"><img src="assets/images/${config.poster}.webp" alt="" loading="lazy"><div class="prototype-cover-copy"><strong>${config.title}</strong><p>${config.intro}</p><button type="button" data-start>开始体验 →</button></div></div></div>
      <p class="prototype-status" role="status">点击开始后加载原型；切换片段会重置本次演示。小屏幕可在原型区域内横向滑动。</p>`;
    const scroll = host.querySelector('.prototype-scroll');
    const status = host.querySelector('.prototype-status');
    const expandButton = host.querySelector('[data-expand]');
    function sizeFrame() {
      if (!frame) return;
      const scale = Math.min(1, scroll.clientWidth / 1050);
      const fitted = fit && scale < 1;
      frame.style.width = fitted ? '1050px' : '';
      frame.style.minWidth = fitted ? '0' : '';
      frame.style.height = fitted ? '690px' : '';
      frame.style.minHeight = fitted ? '0' : '';
      frame.style.transform = fitted ? `scale(${scale})` : '';
      frame.style.transformOrigin = 'top left';
      scroll.style.height = fitted ? `${690 * scale}px` : '';
      scroll.style.overflow = fitted ? 'hidden' : '';
      host.querySelector('[data-fit]').textContent = fitted ? '原尺寸操作' : '查看全貌';
      host.querySelector('[data-fit]').setAttribute('aria-pressed', fitted);
    }
    new ResizeObserver(sizeFrame).observe(scroll);
    function url() { return `prototypes/${config.file}.html?entry=${config.entries[selected][0]}&theme=light`; }
    function update() {
      host.querySelector('.prototype-note p').textContent = config.entries[selected][2];
      host.querySelector('.prototype-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(config.entries.length).padStart(2, '0')}`;
      host.querySelector('[data-open]').href = url();
      host.querySelectorAll('[data-entry]').forEach((button, index) => button.setAttribute('aria-pressed', index === selected));
    }
    function start() {
      clearTimeout(timer);
      frame?.remove();
      frame = document.createElement('iframe');
      frame.title = `${config.title}：${config.entries[selected][1]}`;
      frame.setAttribute('sandbox', 'allow-scripts allow-modals');
      frame.setAttribute('referrerpolicy', 'no-referrer');
      frame.src = url();
      scroll.replaceChildren(frame);
      scroll.scrollLeft = 0;
      host.querySelector('[data-reset]').disabled = false;
      host.querySelector('[data-fit]').disabled = false;
      sizeFrame();
      status.textContent = '正在加载交互原型…';
      timer = setTimeout(() => { status.textContent = '若原型未正常显示，可点击「重新开始」或在独立窗口中打开。'; }, 12000);
    }
    function collapse() {
      if (!host.classList.contains('is-expanded')) return;
      host.classList.remove('is-expanded');
      host.removeAttribute('role'); host.removeAttribute('aria-modal'); host.removeAttribute('aria-label');
      document.body.style.overflow = oldOverflow;
      if (placeholder) { placeholder.remove(); placeholder = null; }
      expandButton.textContent = '展开体验 ↗';
      expandButton.focus({ preventScroll: true });
    }
    function expand() {
      if (host.classList.contains('is-expanded')) { collapse(); return; }
      placeholder = document.createElement('div');
      placeholder.style.height = `${host.offsetHeight}px`;
      host.before(placeholder);
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      host.classList.add('is-expanded');
      host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-label', config.title);
      expandButton.textContent = '收起体验 · Esc';
      if (!frame) start();
      expandButton.focus();
    }
    host.querySelectorAll('[data-entry]').forEach(button => button.addEventListener('click', () => { selected = Number(button.dataset.entry); update(); start(); }));
    host.querySelector('[data-start]').addEventListener('click', start);
    host.querySelector('[data-reset]').addEventListener('click', start);
    host.querySelector('[data-fit]').addEventListener('click', () => { fit = !fit; sizeFrame(); });
    expandButton.addEventListener('click', expand);
    addEventListener('keydown', event => {
      if (!host.classList.contains('is-expanded')) return;
      if (event.key === 'Escape') collapse();
      if (event.key === 'Tab') {
        const focusable = [...host.querySelectorAll('button:not(:disabled),a[href],iframe')];
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
      }
    });
    addEventListener('message', event => {
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'portfolio-prototype-escape') collapse();
      if (event.data?.type === 'portfolio-prototype-ready') {
        clearTimeout(timer);
        status.textContent = '可以直接操作 · 小屏幕可切换「查看全貌 / 原尺寸操作」，原尺寸下支持横向滑动。AI 回复与发布均为模拟。';
      }
      if (event.data?.type === 'portfolio-prototype-error') {
        clearTimeout(timer); status.textContent = '片段入口加载异常，可尝试重新开始或在独立窗口中查看原型。';
      }
    });
    update();
  });

  const explorer = document.querySelector('[data-issue-explorer]');
  if (!explorer) return;
  // Only selected public-facing descriptions are included. Owners and attachments are omitted.
  const records = [
    ['需求',2,'创建自定义技能(skill)','P0','已完成','能力扩展','支持用户创建自定义技能(skill)。','让用户能够按自己的任务补充技能入口。'],
    ['需求',3,'提升反应速度','P0','待启动','执行反馈','用户普遍反馈反应速度较慢。','任务等待时间与用户对执行状态的理解。'],
    ['需求',4,'工作区文件管理','P2','待启动','文件管理','提示工作区权限不足、是否增加文件夹恢复按钮、工作区引导。','文件操作需要明确权限、恢复入口与操作引导。'],
    ['需求',6,'token用量及余额可视化','P1','已完成','成本感知','能让用户明确用了多少token、本次预计使用了多少token、剩余多少token。','把模型调用成本转化为用户可理解的反馈。'],
    ['需求',10,'文件一键拖入对话框','P1','已完成','任务输入','支持直接将文件拖入对话框。','缩短从本地文件到任务输入的操作路径。'],
    ['需求',22,'增加产品新手引导，增加讲解视频(链接)等','P1','已完成','首次使用','原表未填写详细需求描述。','首次使用时，帮助用户理解产品价值与操作入口。'],
    ['Bug',2,'网络检索失败','P0','已解决','工具调用','网络检索失败。','外部信息获取失败对任务链路的影响。'],
    ['Bug',5,'生成的内容复制粘贴之后与实际不符','P0','已解决','结果交付','生成的内容复制粘贴之后与实际不符。','展示结果与实际可使用内容的一致性。'],
    ['Bug',10,'失败提示：建议浅灰色，当前执行过程中失败提醒过于明显','P1','已解决','执行反馈','失败提示：建议浅灰色，当前执行过程中失败提醒过于明显。','异常提醒的视觉权重与任务执行状态之间的关系。'],
    ['Bug',12,'skill 没有自动引用','P0','已解决','上下文传递','技能中心点击去使用的时候没有携带到窗口，但是在对话窗口手动选是可以的。','从技能中心进入对话时，选择结果是否正确传递。'],
    ['Bug',13,'逐字稿导出功能用不了','P2','未解决','结果交付','逐字稿导出功能用不了。','生成之后的导出同样属于交付链路。'],
    ['Bug',26,'对话输出内容没有自动滚动','P0','已解决','执行反馈','对话输出内容没有自动滚动。','持续输出时，最新内容能否及时进入视野。']
  ];
  explorer.classList.add('issue-explorer');
  explorer.innerHTML = `<div class="issue-stats"><div class="issue-stat"><strong>27</strong>条需求<p>15 已完成 · 2 开发中 · 8 待启动 · 2 未填写状态</p></div><div class="issue-stat"><strong>34</strong>条 Bug<p>29 已解决 · 4 未解决 · 1 未填写状态</p></div></div>
    <div class="issue-filters"><label>搜索精选记录<input type="search" placeholder="试试：Skill、文件、引导" aria-label="搜索精选记录"></label><label>类型<select data-kind><option value="">全部类型</option><option>需求</option><option>Bug</option></select></label><label>状态<select data-status><option value="">全部状态</option><option>已完成</option><option>待启动</option><option>已解决</option><option>未解决</option></select></label></div>
    <p class="issue-result" aria-live="polite"></p><div class="issue-list"></div>
    <p class="demo-footer">来源：实习期间《桌面端智能体需求及Bug清单 (1)》。以上总数按原表有标题的记录统计，状态为文件快照，不代表当前线上状态或个人修复成果。精选条目省略人员与附件信息；“关注点”为展示归纳。</p>`;
  const search = explorer.querySelector('input');
  const kind = explorer.querySelector('[data-kind]');
  const status = explorer.querySelector('[data-status]');
  function render() {
    const query = search.value.trim().toLowerCase();
    const filtered = records.filter(r => (!kind.value || r[0] === kind.value) && (!status.value || r[4] === status.value) && r.join(' ').toLowerCase().includes(query));
    explorer.querySelector('.issue-result').textContent = `精选 ${records.length} 条 · 当前显示 ${filtered.length} 条 · 点击条目展开`;
    explorer.querySelector('.issue-list').innerHTML = filtered.length ? filtered.map(r => `<details><summary><span class="issue-type">${r[0]}</span><span>${r[2]}</span><span class="issue-priority">${r[3]}</span><span class="issue-status ${['已完成','已解决'].includes(r[4]) ? 'done' : ''}">${r[4]}</span></summary><div class="issue-detail"><p><b>记录内容</b>　${r[6]}</p><p><b>关注点 · ${r[5]}</b>　${r[7]}</p><small>原表：${r[0] === '需求' ? '需求管理' : 'Bug管理'} · 第 ${r[1]} 行 · ${r[3]} · ${r[4]}</small></div></details>`).join('') : '<p class="issue-empty">没有匹配的精选记录，试试其他关键词或筛选条件。</p>';
  }
  [search,kind,status].forEach(input => input.addEventListener('input', render));
  render();
})();
