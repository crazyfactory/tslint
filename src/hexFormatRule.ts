import * as Lint from "tslint";
import * as ts from "typescript";

class HexFormatRule extends Lint.RuleWalker {
  private readonly case: "lowercase" | "uppercase" = "lowercase";
  private allowedLengths: number[] = [4, 7];

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    if (options.ruleArguments[0]) {
      if (options.ruleArguments[0].case) {
        this.case = options.ruleArguments[0].case;
      }
      if (options.ruleArguments[0].allowedLengths) {
        this.allowedLengths = options.ruleArguments[0].allowedLengths;
      }
    }
  }
  public visitStringLiteral(node: ts.StringLiteral): void {
    super.visitStringLiteral(node);
    const matches = node.text.match(/#\S*/g);
    if (!matches) {
      return;
    }
    for (const match of matches) {
      if (this.allowedLengths.indexOf(match.length) === -1) {
        this.addFailureAtNode(node, "Incorrect hex format length");
        return;
      }
      if (this.case === "uppercase") {
        if (match.toUpperCase() !== match) {
          this.addFailureAtNode(node, "Hex format should be uppercase");
        }
        return;
      } else {
        if (match.toLowerCase() !== match) {
          this.addFailureAtNode(node, "Hex format should be lowercase");
        }
        return;
      }
    }
  }
}

// tslint:disable-next-line:export-name max-classes-per-file
export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new HexFormatRule(sourceFile, this.getOptions()));
  }
}
