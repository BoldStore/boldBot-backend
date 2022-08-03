export class Response {
  static genQuickReply(
    text: string,
    quickReplies: { title: string; payload: string }[],
  ) {
    const response = {
      text: text,
      quick_replies: [],
    };

    for (const quickReply of quickReplies) {
      response['quick_replies'].push({
        content_type: 'text',
        title: quickReply['title'],
        payload: quickReply['payload'],
      });
    }

    return response;
  }

  static genImage(url: string) {
    const response = {
      attachment: {
        type: 'image',
        payload: {
          url: url,
        },
      },
    };

    return response;
  }

  static genText(text: string) {
    const response = {
      text: text,
    };

    return response;
  }

  static genPostbackButton(title: any, payload: any) {
    const response = {
      type: 'postback',
      title: title,
      payload: payload,
    };

    return response;
  }

  static genGenericTemplate(
    image_url: any,
    title: any,
    subtitle: any,
    buttons: any,
  ) {
    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url,
              buttons: buttons,
            },
          ],
        },
      },
    };

    return response;
  }

  static genNuxMessage(user: any) {
    console.log(user);
    const welcome = this.genText('get_started.welcome');

    const guide = this.genText('get_started.guidance');

    const curation = this.genQuickReply('get_started.help', [
      {
        title: 'Menu Suggestion',
        payload: 'CURATION',
      },
      {
        title: 'Menu Help',
        payload: 'CARE_HELP',
      },
    ]);

    return [welcome, guide, curation];
  }
}
