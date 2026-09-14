import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  cpSync,
  mkdirSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const source = fileURLToPath(new URL("../", import.meta.url));

test("deux worktrees ont leurs données et une réinitialisation indépendantes", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "support-worktree-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const main = join(dir, "main");
  const other = join(dir, "autre");
  mkdirSync(join(main, "data"), { recursive: true });
  for (const name of ["backend", "scripts", "package.json", ".gitignore"])
    cpSync(join(source, name), join(main, name), { recursive: true });
  cpSync(
    join(source, "data/tickets.seed.json"),
    join(main, "data/tickets.seed.json"),
  );
  const git = (...args) =>
    execFileSync("git", args, { cwd: main, stdio: "pipe" });
  git("init", "-b", "main");
  git(
    "add",
    "backend",
    "scripts",
    "package.json",
    ".gitignore",
    "data/tickets.seed.json",
  );
  git(
    "-c",
    "user.name=Formation test",
    "-c",
    "user.email=test@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "Fixture initiale",
  );
  git("worktree", "add", other, "-b", "test-isolation");
  const run = (cwd, code) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", code], {
      cwd,
      encoding: "utf8",
    });
  const load = (cwd) =>
    JSON.parse(readFileSync(join(cwd, "data/tickets.local.json"), "utf8"));
  run(
    main,
    'import {createStore} from "./backend/store.js"; createStore().create({subject:"Copie principale",description:"Une demande uniquement dans cette copie."});',
  );
  assert.equal(load(main).length, 4);
  assert.equal(existsSync(join(other, "data/tickets.local.json")), false);
  run(
    other,
    'import {createStore} from "./backend/store.js"; createStore().create({subject:"Autre copie",description:"Une autre demande uniquement dans ce worktree."});',
  );
  assert.equal(load(other).length, 4);
  assert.equal(
    load(main).some((ticket) => ticket.subject === "Autre copie"),
    false,
  );
  // Sans confirmation et sans terminal interactif : aucune modification.
  execFileSync(process.execPath, [join(other, "scripts/reset-data.js")], {
    cwd: dir,
    stdio: "pipe",
  });
  assert.equal(load(other).length, 4);
  // Le script est lancé depuis un troisième dossier pour vérifier son ancrage.
  execFileSync(
    process.execPath,
    [join(other, "scripts/reset-data.js"), "--yes"],
    { cwd: dir, stdio: "pipe" },
  );
  assert.equal(load(other).length, 3);
  assert.equal(load(main).length, 4);
  assert.equal(git("status", "--porcelain").toString(), "");
  assert.equal(
    execFileSync("git", ["status", "--porcelain"], { cwd: other }).toString(),
    "",
  );
});
