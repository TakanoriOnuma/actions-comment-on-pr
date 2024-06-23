import * as core from '@actions/core';
import { getOctokit, context } from '@actions/github';
import fs from 'fs';

export async function run(): Promise<void> {
  const messageFilePath = core.getInput('message-file-path', {
    required: true,
  });
  const message = fs.readFileSync(messageFilePath, 'utf8');

  const identifierMessage = core.getInput('identifier-message') || undefined;
  const GITHUB_TOKEN = core.getInput('github-token');

  const github = getOctokit(GITHUB_TOKEN);

  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const existingComment =
    identifierMessage != null
      ? comments.data.find((comment) =>
          comment.body?.includes(identifierMessage),
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
}
