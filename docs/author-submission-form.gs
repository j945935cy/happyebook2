const SCRIPT_PROPERTY_KEYS = {
  formId: 'HAPPYEBOOK2_AUTHOR_FORM_ID',
  spreadsheetId: 'HAPPYEBOOK2_AUTHOR_SPREADSHEET_ID',
  adminEmails: 'HAPPYEBOOK2_ADMIN_NOTIFICATION_EMAILS',
  sequenceDate: 'HAPPYEBOOK2_SUBMISSION_SEQUENCE_DATE',
  sequenceValue: 'HAPPYEBOOK2_SUBMISSION_SEQUENCE_VALUE'
};

const SHEET_NAMES = {
  responses: '表單回覆',
  admin: '投稿管理',
  notes: '使用說明'
};

const STATUS = {
  pending: '待審核',
  underReview: '審核中',
  needsRevision: '待補件',
  approved: '通過',
  rejected: '不通過',
  discussing: '後續洽談中',
  contacted: '已聯繫作者',
  awaitingContract: '待簽約',
  scheduled: '已排程上架',
  published: '已上架'
};

const ADMIN_HEADERS = [
  '投稿編號',
  '表單回覆 ID',
  '投稿時間',
  '作者姓名',
  '聯絡 Email',
  '聯絡電話',
  '作品名稱',
  '作品類型',
  '內容形式',
  '審核狀態',
  '補件截止日',
  '負責編輯',
  '最後通知時間',
  '最近通知類型',
  '補件說明 / 審核備註'
];

function createHappyebookAuthorSubmissionForm() {
  const formTitle = 'happyebook2 作者投稿申請表';
  const sheetTitle = 'happyebook2 作者投稿資料';

  const form = FormApp.create(formTitle);
  const spreadsheet = SpreadsheetApp.create(sheetTitle);

  form
    .setTitle(formTitle)
    .setDescription([
      '歡迎投稿至 happyebook2。',
      '請完整填寫作者資料、作品資訊、授權狀態與附件，供平台初步審查。',
      '若資料完整且符合平台方向，我們將於 7 到 14 個工作天內聯繫。'
    ].join('\n'))
    .setConfirmationMessage(
      '投稿資料已送出，我們會先進行初步審查。若資料完整且符合平台方向，將由編輯團隊於 7 到 14 個工作天內與您聯繫。'
    )
    .setProgressBar(true)
    .setAllowResponseEdits(false)
    .setAcceptingResponses(true)
    .setCollectEmail(true)
    .setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  addAuthorSection_(form);
  addWorkSection_(form);
  addPublishingSection_(form);
  addUploadSection_(form);
  addCooperationSection_(form);
  addAgreementSection_(form);

  setupResponseSpreadsheet_(spreadsheet);
  saveConfig_({
    formId: form.getId(),
    spreadsheetId: spreadsheet.getId(),
    adminEmails: Session.getActiveUser().getEmail() || ''
  });
  installSubmissionTrigger_(form);

  Logger.log('表單編輯網址: %s', form.getEditUrl());
  Logger.log('表單填寫網址: %s', form.getPublishedUrl());
  Logger.log('回覆試算表: %s', spreadsheet.getUrl());

  return {
    formId: form.getId(),
    formEditUrl: form.getEditUrl(),
    formPublishedUrl: form.getPublishedUrl(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
}

function reinstallAuthorSubmissionTrigger() {
  const config = getConfig_();
  if (!config.formId) {
    throw new Error('找不到表單 ID，請先執行 createHappyebookAuthorSubmissionForm() 或手動設定 Script Properties。');
  }

  const form = FormApp.openById(config.formId);
  installSubmissionTrigger_(form);
}

function setAdminNotificationEmails(emails) {
  const normalized = Array.isArray(emails) ? emails.join(',') : String(emails || '');
  const config = getConfig_();
  saveConfig_({
    formId: config.formId,
    spreadsheetId: config.spreadsheetId,
    adminEmails: normalized
  });
}

function onAuthorSubmissionFormSubmit(e) {
  if (!e || !e.response) {
    throw new Error('缺少表單提交事件物件。');
  }

  const config = getConfig_();
  const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  const adminSheet = spreadsheet.getSheetByName(SHEET_NAMES.admin);
  const response = e.response;
  const answers = getAnswerMap_(response);
  const submissionId = nextSubmissionId_();
  const submittedAt = response.getTimestamp();
  const authorName = answers['作者姓名'] || '';
  const authorEmail = answers['聯絡 Email'] || response.getRespondentEmail() || '';
  const phone = answers['聯絡電話'] || '';
  const workTitle = answers['作品名稱'] || '';
  const workType = answers['作品類型'] || '';
  const formats = answers['內容形式'] || '';

  adminSheet.appendRow([
    submissionId,
    response.getId(),
    submittedAt,
    authorName,
    authorEmail,
    phone,
    workTitle,
    workType,
    formats,
    STATUS.pending,
    '',
    '',
    new Date(),
    '投稿確認信',
    '系統已收到投稿資料，待編輯審核。'
  ]);

  sendReceiptEmail_(submissionId, answers, submittedAt, authorEmail);
  sendAdminNotificationEmail_(submissionId, answers, submittedAt, config.adminEmails);
}

function markSubmissionUnderReview(submissionId, editorName, note) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.underReview,
    editorName: editorName || '',
    note: note || '編輯已開始審核。',
    notificationType: ''
  });
}

function requestSubmissionRevision(submissionId, revisionNote, dueDate, editorName) {
  const record = updateSubmissionStatus_(submissionId, {
    status: STATUS.needsRevision,
    editorName: editorName || '',
    note: revisionNote || '請依信件內容補充投稿資料。',
    dueDate: dueDate || '',
    notificationType: '補件通知'
  });

  sendRevisionRequestEmail_(record, revisionNote || '請補充投稿資料後再回覆此信。', dueDate || '');
  stampNotification_(record.rowIndex, '補件通知');
}

function approveSubmission(submissionId, approveNote, editorName) {
  const record = updateSubmissionStatus_(submissionId, {
    status: STATUS.approved,
    editorName: editorName || '',
    note: approveNote || '投稿已通過初步審核。',
    notificationType: '通過通知'
  });

  sendApprovalEmail_(record, approveNote || '投稿已通過初步審核，我們將另行與您聯繫後續合作細節。');
  stampNotification_(record.rowIndex, '通過通知');
}

function rejectSubmission(submissionId, rejectNote, editorName) {
  const record = updateSubmissionStatus_(submissionId, {
    status: STATUS.rejected,
    editorName: editorName || '',
    note: rejectNote || '本次投稿未通過審核。',
    notificationType: '未通過通知'
  });

  sendRejectionEmail_(record, rejectNote || '感謝您的投稿，本次內容未能納入平台規劃。');
  stampNotification_(record.rowIndex, '未通過通知');
}

function moveSubmissionToDiscussion(submissionId, note, editorName) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.discussing,
    editorName: editorName || '',
    note: note || '已進入後續合作洽談。',
    notificationType: ''
  });
}

function markSubmissionContacted(submissionId, note, editorName) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.contacted,
    editorName: editorName || '',
    note: note || '已與作者建立聯繫，待確認合作細節。',
    notificationType: '已聯繫作者'
  });
}

function markSubmissionAwaitingContract(submissionId, note, editorName) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.awaitingContract,
    editorName: editorName || '',
    note: note || '已確認合作方向，待簽署授權或合作文件。',
    notificationType: '待簽約'
  });
}

function markSubmissionScheduled(submissionId, note, editorName) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.scheduled,
    editorName: editorName || '',
    note: note || '已納入上架排程，待製作頁面與上架資料。',
    notificationType: '已排程上架'
  });
}

function markSubmissionPublished(submissionId, note, editorName) {
  updateSubmissionStatus_(submissionId, {
    status: STATUS.published,
    editorName: editorName || '',
    note: note || '作品已完成上架。',
    notificationType: '已上架'
  });
}

function resendReceiptEmail(submissionId) {
  const record = getSubmissionRecord_(submissionId);
  sendReceiptEmail_(
    record.values[0],
    {
      '作者姓名': record.values[3],
      '聯絡 Email': record.values[4],
      '作品名稱': record.values[6],
      '作品類型': record.values[7]
    },
    record.values[2],
    record.values[4]
  );
  stampNotification_(record.rowIndex, '重寄投稿確認信');
}

function addAuthorSection_(form) {
  form.addSectionHeaderItem()
    .setTitle('一、作者基本資料')
    .setHelpText('請填寫投稿代表人的基本資料。');

  form.addTextItem()
    .setTitle('作者姓名')
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText('請填入 2 到 50 個字。')
        .requireTextLengthGreaterThanOrEqualTo(2)
        .requireTextLengthLessThanOrEqualTo(50)
        .build()
    );

  form.addTextItem()
    .setTitle('筆名')
    .setRequired(false);

  form.addTextItem()
    .setTitle('聯絡 Email')
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText('請填寫有效的 Email。')
        .requireTextIsEmail()
        .build()
    );

  form.addTextItem()
    .setTitle('聯絡電話')
    .setRequired(true)
    .setHelpText('可填手機或市話，例如 0912345678、02-1234-5678。')
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText('請填寫有效的電話格式。')
        .requireTextMatchesPattern('^(0\\d{1,2}-?\\d{6,8}|09\\d{2}-?\\d{3}-?\\d{3})$')
        .build()
    );

  form.addListItem()
    .setTitle('居住地區')
    .setRequired(true)
    .setChoiceValues(['台灣', '香港', '澳門', '海外其他']);

  form.addParagraphTextItem()
    .setTitle('個人簡介')
    .setRequired(true)
    .setHelpText('建議填寫創作背景、專長領域與經歷。')
    .setValidation(
      FormApp.createParagraphTextValidation()
        .setHelpText('請填入至少 50 個字。')
        .requireTextLengthGreaterThanOrEqualTo(50)
        .build()
    );

  form.addTextItem()
    .setTitle('個人網站 / 社群連結')
    .setRequired(false)
    .setHelpText('若有多個網址，請以逗號分隔。');
}

function addWorkSection_(form) {
  form.addPageBreakItem()
    .setTitle('二、投稿作品資料')
    .setHelpText('請提供作品內容與完成狀態。');

  form.addTextItem()
    .setTitle('作品名稱')
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .setHelpText('請填入 1 到 100 個字。')
        .requireTextLengthGreaterThanOrEqualTo(1)
        .requireTextLengthLessThanOrEqualTo(100)
        .build()
    );

  form.addTextItem()
    .setTitle('作品副標題')
    .setRequired(false);

  form.addListItem()
    .setTitle('作品類型')
    .setRequired(true)
    .setChoiceValues([
      '語言學習',
      '教材教學',
      '文學創作',
      '非小說',
      '兒童讀物',
      '專業知識',
      '其他'
    ]);

  form.addCheckboxItem()
    .setTitle('內容形式')
    .setRequired(true)
    .setChoiceValues([
      'PDF 電子書',
      'EPUB 電子書',
      '網頁版內容',
      '系列文章',
      '附教材資源'
    ]);

  form.addParagraphTextItem()
    .setTitle('作品簡介')
    .setRequired(true)
    .setHelpText('請摘要說明作品主題、特色與章節方向。')
    .setValidation(
      FormApp.createParagraphTextValidation()
        .setHelpText('請填入至少 100 個字。')
        .requireTextLengthGreaterThanOrEqualTo(100)
        .build()
    );

  form.addParagraphTextItem()
    .setTitle('目標讀者')
    .setRequired(true)
    .setHelpText('例如：國中生、英文初學者、家長、教師。');

  form.addListItem()
    .setTitle('作品語言')
    .setRequired(true)
    .setChoiceValues(['繁體中文', '英文', '日文', '其他']);

  const completionItem = form.addMultipleChoiceItem()
    .setTitle('是否已完稿')
    .setRequired(true);

  const expectedFinishPage = form.addPageBreakItem()
    .setTitle('三、預計完稿日期')
    .setHelpText('僅限尚未完稿作品填寫。');

  const publishingPage = form.addPageBreakItem()
    .setTitle('四、出版與授權狀態')
    .setHelpText('請確認作品原創性與授權狀態。');

  completionItem.setChoices([
    completionItem.createChoice('已完稿', publishingPage),
    completionItem.createChoice('部分完成', expectedFinishPage),
    completionItem.createChoice('企劃中', expectedFinishPage)
  ]);

  form.addDateItem()
    .setTitle('預計完稿日期')
    .setRequired(true)
    .setIncludesYear(true)
    .setHelpText('若目前尚未完稿，請填寫預計完成日期。');

  expectedFinishPage.setGoToPage(publishingPage);
}

function addPublishingSection_(form) {
  form.addMultipleChoiceItem()
    .setTitle('是否為原創作品')
    .setRequired(true)
    .setChoiceValues(['是', '否']);

  form.addMultipleChoiceItem()
    .setTitle('是否曾公開發表')
    .setRequired(true)
    .setChoiceValues(['否', '個人網站', '社群平台', '其他平台', '已出版']);

  form.addParagraphTextItem()
    .setTitle('公開發表說明')
    .setRequired(false)
    .setHelpText('若曾公開發表，請補充平台名稱、時間與網址。');

  form.addMultipleChoiceItem()
    .setTitle('是否擁有完整授權')
    .setRequired(true)
    .setChoiceValues(['是', '否']);

  form.addMultipleChoiceItem()
    .setTitle('是否同意平台審核後聯繫洽談上架')
    .setRequired(true)
    .setChoiceValues(['同意', '不同意']);
}

function addUploadSection_(form) {
  form.addPageBreakItem()
    .setTitle('五、投稿附件')
    .setHelpText('請先將附件上傳至 Google Drive 或其他雲端空間，並提供可檢視的分享連結。');

  form.addTextItem()
    .setTitle('作品樣章連結')
    .setRequired(true)
    .setHelpText('請貼上 PDF、DOCX 或雲端資料夾分享連結。');

  form.addTextItem()
    .setTitle('封面草圖或相關圖片連結')
    .setRequired(false)
    .setHelpText('請貼上 JPG、PNG、PDF 或雲端資料夾分享連結。');

  form.addTextItem()
    .setTitle('補充資料連結')
    .setRequired(false)
    .setHelpText('可提供目錄、提案書、作者介紹或課程規劃等連結。');
}

function addCooperationSection_(form) {
  form.addPageBreakItem()
    .setTitle('六、平台合作意向')
    .setHelpText('請選擇希望的合作方向。');

  form.addCheckboxItem()
    .setTitle('希望上架方式')
    .setRequired(true)
    .setChoiceValues(['免費公開', '付費販售', '部分試閱 + 付費完整版', '可討論']);

  form.addCheckboxItem()
    .setTitle('希望提供格式')
    .setRequired(true)
    .setChoiceValues(['PDF', 'EPUB', '網頁版']);

  form.addMultipleChoiceItem()
    .setTitle('是否可配合內容編修')
    .setRequired(true)
    .setChoiceValues(['可以', '不可以', '需另行討論']);

  form.addParagraphTextItem()
    .setTitle('其他合作說明')
    .setRequired(false);
}

function addAgreementSection_(form) {
  form.addPageBreakItem()
    .setTitle('七、確認與同意')
    .setHelpText('以下三項皆需勾選，才可送出投稿申請。');

  form.addCheckboxItem()
    .setTitle('確認聲明')
    .setRequired(true)
    .setChoiceValues(['本人確認所填資料真實無誤']);

  form.addCheckboxItem()
    .setTitle('著作權聲明')
    .setRequired(true)
    .setChoiceValues(['本人確認投稿內容未侵害他人著作權']);

  form.addCheckboxItem()
    .setTitle('個資使用同意')
    .setRequired(true)
    .setChoiceValues(['本人同意 happyebook2 依投稿審核目的使用本表資料']);
}

function setupResponseSpreadsheet_(spreadsheet) {
  const responseSheet = spreadsheet.getSheets()[0];
  responseSheet.setName(SHEET_NAMES.responses);

  const adminSheet = spreadsheet.insertSheet(SHEET_NAMES.admin);
  adminSheet.getRange(1, 1, 1, ADMIN_HEADERS.length).setValues([ADMIN_HEADERS]);
  adminSheet.setFrozenRows(1);
  adminSheet.autoResizeColumns(1, ADMIN_HEADERS.length);
  setAdminStatusValidation_(adminSheet);

  const noteSheet = spreadsheet.insertSheet(SHEET_NAMES.notes);
  noteSheet.getRange('A1').setValue('happyebook2 作者投稿表單使用說明');
  noteSheet.getRange('A2').setValue('1. 作者送出表單後，系統會自動產生投稿編號並寄出投稿確認信。');
  noteSheet.getRange('A3').setValue('2. 管理者可使用 requestSubmissionRevision、approveSubmission、rejectSubmission 等函式推進審核流程。');
  noteSheet.getRange('A4').setValue('3. 若已進入合作階段，可使用 markSubmissionContacted、markSubmissionAwaitingContract、markSubmissionScheduled、markSubmissionPublished 更新狀態。');
  noteSheet.getRange('A5').setValue('4. 若需通知多位管理者，請執行 setAdminNotificationEmails("a@example.com,b@example.com")。');
  noteSheet.getRange('A6').setValue('5. 目前附件欄位採連結方式提交，請要求投稿者提供可檢視的雲端分享網址。');
  noteSheet.autoResizeColumn(1);
}

function setAdminStatusValidation_(sheet) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(getAvailableStatuses_(), true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange(2, 10, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

function getAvailableStatuses_() {
  return [
    STATUS.pending,
    STATUS.underReview,
    STATUS.needsRevision,
    STATUS.approved,
    STATUS.rejected,
    STATUS.discussing,
    STATUS.contacted,
    STATUS.awaitingContract,
    STATUS.scheduled,
    STATUS.published
  ];
}

function updateSubmissionStatus_(submissionId, options) {
  const record = getSubmissionRecord_(submissionId);
  const sheet = record.sheet;
  const values = record.values;

  sheet.getRange(record.rowIndex, 10).setValue(options.status || values[9]);
  sheet.getRange(record.rowIndex, 11).setValue(options.dueDate || values[10]);
  sheet.getRange(record.rowIndex, 12).setValue(options.editorName || values[11]);
  if (options.notificationType) {
    sheet.getRange(record.rowIndex, 14).setValue(options.notificationType);
  }
  sheet.getRange(record.rowIndex, 15).setValue(options.note || values[14]);

  record.values = sheet.getRange(record.rowIndex, 1, 1, ADMIN_HEADERS.length).getValues()[0];
  return record;
}

function stampNotification_(rowIndex, notificationType) {
  const sheet = getAdminSheet_();
  sheet.getRange(rowIndex, 13).setValue(new Date());
  sheet.getRange(rowIndex, 14).setValue(notificationType);
}

function getSubmissionRecord_(submissionId) {
  const sheet = getAdminSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('投稿管理表中尚無任何資料。');
  }

  const values = sheet.getRange(2, 1, lastRow - 1, ADMIN_HEADERS.length).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (values[index][0] === submissionId) {
      return {
        sheet: sheet,
        rowIndex: index + 2,
        values: values[index]
      };
    }
  }

  throw new Error('找不到投稿編號：' + submissionId);
}

function getAdminSheet_() {
  const config = getConfig_();
  const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.admin);
  if (!sheet) {
    throw new Error('找不到工作表：' + SHEET_NAMES.admin);
  }
  return sheet;
}

function getAnswerMap_(response) {
  return response.getItemResponses().reduce(function(map, itemResponse) {
    const title = itemResponse.getItem().getTitle();
    const raw = itemResponse.getResponse();
    map[title] = Array.isArray(raw) ? raw.join(', ') : raw;
    return map;
  }, {});
}

function nextSubmissionId_() {
  const properties = PropertiesService.getScriptProperties();
  const timeZone = Session.getScriptTimeZone() || 'Asia/Taipei';
  const today = Utilities.formatDate(new Date(), timeZone, 'yyyyMMdd');
  const savedDate = properties.getProperty(SCRIPT_PROPERTY_KEYS.sequenceDate);
  const savedValue = Number(properties.getProperty(SCRIPT_PROPERTY_KEYS.sequenceValue) || '0');
  const nextValue = savedDate === today ? savedValue + 1 : 1;

  properties.setProperty(SCRIPT_PROPERTY_KEYS.sequenceDate, today);
  properties.setProperty(SCRIPT_PROPERTY_KEYS.sequenceValue, String(nextValue));

  return 'HB-' + today + '-' + Utilities.formatString('%03d', nextValue);
}

function installSubmissionTrigger_(form) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onAuthorSubmissionFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('onAuthorSubmissionFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}

function getConfig_() {
  const properties = PropertiesService.getScriptProperties();
  return {
    formId: properties.getProperty(SCRIPT_PROPERTY_KEYS.formId) || '',
    spreadsheetId: properties.getProperty(SCRIPT_PROPERTY_KEYS.spreadsheetId) || '',
    adminEmails: properties.getProperty(SCRIPT_PROPERTY_KEYS.adminEmails) || ''
  };
}

function saveConfig_(config) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperties({
    HAPPYEBOOK2_AUTHOR_FORM_ID: config.formId || '',
    HAPPYEBOOK2_AUTHOR_SPREADSHEET_ID: config.spreadsheetId || '',
    HAPPYEBOOK2_ADMIN_NOTIFICATION_EMAILS: config.adminEmails || ''
  }, true);
}

function sendReceiptEmail_(submissionId, answers, submittedAt, authorEmail) {
  if (!authorEmail) {
    return;
  }

  const subject = '【happyebook2】已收到您的投稿資料：' + submissionId;
  const body = [
    (answers['作者姓名'] || '投稿作者') + ' 您好：',
    '',
    '我們已收到您的投稿資料，以下為本次投稿資訊：',
    '投稿編號：' + submissionId,
    '投稿時間：' + formatDateTime_(submittedAt),
    '作品名稱：' + (answers['作品名稱'] || '未填寫'),
    '作品類型：' + (answers['作品類型'] || '未填寫'),
    '',
    '接下來我們會進行初步審查。若資料完整且符合平台方向，將於 7 到 14 個工作天內與您聯繫。',
    '若後續需要補件，也會以此信箱通知。',
    '',
    'happyebook2 團隊 敬上'
  ].join('\n');

  MailApp.sendEmail(authorEmail, subject, body);
}

function sendAdminNotificationEmail_(submissionId, answers, submittedAt, adminEmails) {
  const recipients = normalizeEmailList_(adminEmails);
  if (!recipients) {
    return;
  }

  const subject = '【投稿通知】收到新投稿：' + submissionId + ' / ' + (answers['作品名稱'] || '未命名作品');
  const body = [
    '有新的作者投稿資料送出。',
    '',
    '投稿編號：' + submissionId,
    '投稿時間：' + formatDateTime_(submittedAt),
    '作者姓名：' + (answers['作者姓名'] || '未填寫'),
    '聯絡 Email：' + (answers['聯絡 Email'] || '未填寫'),
    '聯絡電話：' + (answers['聯絡電話'] || '未填寫'),
    '作品名稱：' + (answers['作品名稱'] || '未填寫'),
    '作品類型：' + (answers['作品類型'] || '未填寫'),
    '內容形式：' + (answers['內容形式'] || '未填寫'),
    '',
    '請前往「投稿管理」工作表開始審核。'
  ].join('\n');

  MailApp.sendEmail(recipients, subject, body);
}

function sendRevisionRequestEmail_(record, revisionNote, dueDate) {
  const authorEmail = record.values[4];
  if (!authorEmail) {
    return;
  }

  const body = [
    record.values[3] + ' 您好：',
    '',
    '您的投稿已進入補件階段，請依下列說明補充資料：',
    '投稿編號：' + record.values[0],
    '作品名稱：' + record.values[6],
    '補件說明：' + revisionNote,
    dueDate ? '補件截止日：' + dueDate : '',
    '',
    '完成後請直接回覆本信，或依雙方約定方式補交資料。',
    '',
    'happyebook2 團隊 敬上'
  ].filter(Boolean).join('\n');

  MailApp.sendEmail(authorEmail, '【happyebook2】補件通知：' + record.values[0], body);
}

function sendApprovalEmail_(record, approveNote) {
  const authorEmail = record.values[4];
  if (!authorEmail) {
    return;
  }

  const body = [
    record.values[3] + ' 您好：',
    '',
    '恭喜，您的投稿已通過初步審核。',
    '投稿編號：' + record.values[0],
    '作品名稱：' + record.values[6],
    '說明：' + approveNote,
    '',
    '我們將再與您聯繫後續上架與合作細節。',
    '',
    'happyebook2 團隊 敬上'
  ].join('\n');

  MailApp.sendEmail(authorEmail, '【happyebook2】投稿審核通過：' + record.values[0], body);
}

function sendRejectionEmail_(record, rejectNote) {
  const authorEmail = record.values[4];
  if (!authorEmail) {
    return;
  }

  const body = [
    record.values[3] + ' 您好：',
    '',
    '感謝您投稿至 happyebook2。',
    '經本次審核評估，您的投稿目前未納入平台規劃。',
    '投稿編號：' + record.values[0],
    '作品名稱：' + record.values[6],
    '說明：' + rejectNote,
    '',
    '仍感謝您的準備與信任，期待未來有合適的作品再次投稿。',
    '',
    'happyebook2 團隊 敬上'
  ].join('\n');

  MailApp.sendEmail(authorEmail, '【happyebook2】投稿審核結果通知：' + record.values[0], body);
}

function normalizeEmailList_(emails) {
  return String(emails || '')
    .split(/[;,]/)
    .map(function(email) {
      return email.trim();
    })
    .filter(function(email) {
      return email;
    })
    .join(',');
}

function formatDateTime_(value) {
  const timeZone = Session.getScriptTimeZone() || 'Asia/Taipei';
  return Utilities.formatDate(new Date(value), timeZone, 'yyyy/MM/dd HH:mm:ss');
}
