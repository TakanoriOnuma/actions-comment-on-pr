// 型情報を読み込む
// ref: https://zenn.dev/ikoamu/articles/5b4c646376b60e#jsdoc%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E5%9E%8B%E8%A3%9C%E5%AE%8C
/**
 * @typedef {import('@actions/github').context} Context
 * @typedef {import('@actions/core')} Core
 * @typedef {ReturnType<import('@actions/github')['getOctokit']} GitHub
 */

/**
 * PR上にコメントする
 * @param {Object} params - パラメータ
 * @param {string} params.message - メッセージ
 * @param {string|undefined} params.identifierMessage - 識別メッセージ（識別子メッセージのコメントが既にある場合は更新する）
 * @param {Object} contexts - GitHub Actionsのコンテキストグループ
 * @param {GitHub} contexts.github - GitHub APIを利用するためのOctokitインスタンス
 * @param {Context} contexts.context - GitHub Actionsのコンテキスト
 */
const commentOnPr = async (
  { message, identifierMessage },
  { github, context },
) => {
  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const existingComment =
    identifierMessage != null
      ? comments.data.find((comment) =>
          comment.body.includes(identifierMessage),
        )
      : null;

  const body = [identifierMessage, message].filter((msg) => !!msg).join('\n');

  if (existingComment) {
    console.log('Updating existing comment:', existingComment.html_url);
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existingComment.id,
      body,
    });
  } else {
    const { data } = await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body,
    });
    console.log('Created new comment:', data.html_url);
  }
};

module.exports = commentOnPr;
