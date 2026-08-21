import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The hinges are the product",
  description:
    "comp0 treats accessible interaction, native form contracts, and server rendering as the durable product, leaving every visual decision to the application.",
  published: "2026-07-18T21:34:00Z",
  author: "Mira Voss",
  tags: ["web", "software"],
  image: {
    src: "/images/articles/the-hinges-are-the-product.jpg",
    alt: "An exposed metal coupling and rubber bellows connect the opening mechanism between two Finnish train doors.",
    credit: {
      author: "Edvard10",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Door_mechanism.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const planSelect = `
  import {
    Label, Select, SelectOption,
    SelectPopover, SelectTrigger, SelectValue,
  } from "@comp0/react";

  <Select name="plan" defaultValue="basic">
    <Label>Plan</Label>
    <SelectTrigger className="trigger">
      <SelectValue placeholder="Choose a plan" />
    </SelectTrigger>
    <SelectPopover className="popover">
      <SelectOption value="basic">Basic</SelectOption>
      <SelectOption value="pro">Pro</SelectOption>
    </SelectPopover>
  </Select>
`;

const nativeBridge = `
  const content = (
    <>
      <select
        ref={selectRef}
        aria-hidden="true"
        name={name}
        form={form}
        required={resolvedRequired}
        value={selected}
        onInvalid={(event) => {
          event.preventDefault();
          document.getElementById(controlId)?.focus();
        }}
        style={nativeSelectStyle}
        tabIndex={-1}
      >
        {/* native value bridge */}
      </select>
      {children}
    </>
  );
`;

const inventoryTest = `
  const move = page.getByRole("button", { name: "Move Card" });
  const card = move.element().closest("li")!;

  await userEvent.keyboard("{Enter}{ArrowRight}");
  expect(card.dataset.column).toBe("2");
  expect(card).toHaveAttribute("data-dragging");

  await userEvent.tab();
  expect(card.dataset.column).toBe("1");
  expect(card).not.toHaveAttribute("data-dragging");
`;

const ownershipRows = [
  [
    <a key="button" href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/components/Button.tsx">
      Button
    </a>,
    "Native activation, focus visibility, disabled and pending behavior",
    "Element choice, copy, layout, and every pixel",
  ],
  [
    <a key="select" href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/components/Select.tsx">
      Select
    </a>,
    "Value, open state, labels, listbox wiring, form submission, reset, and validation",
    "Trigger anatomy, popover surface, option rendering, and styling",
  ],
  [
    <a key="inventory" href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/components/Inventory.tsx">
      Inventory
    </a>,
    "Spatial focus, move and resize sessions, collision rules, cancellation, and announcements",
    "Grid policy, card contents, handles, preview, and persistence",
  ],
  [
    <a key="tree-grid" href="https://github.com/mewhhaha/comp0/blob/main/apps/docs/src/content/catalog.ts">
      TreeGrid
    </a>,
    "Hierarchy, expansion, selection, visible-row navigation, and cell movement",
    "Columns, row data, density, disclosure marks, and visual hierarchy",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          A headless button is an afternoon of work, which is why every framework ecosystem has forty of them. A
          component library gets interesting when its custom select still submits through an HTML form, resets with
          that form, redirects an invalid submission to the visible trigger, hydrates without a mismatch, and lets
          you replace every visible surface anyway.
        </p>
        <p>
          That is what <a href="https://github.com/mewhhaha/comp0">comp0</a> sells, and it picked well. The
          repository ships no component CSS and no house class names; what is actually in the box — native bridges,
          keyboard contracts, ARIA relationships, browser tests, React 19 packaging — is the part of a component
          library that survives a redesign.
        </p>

        <H2>The one-pixel select</H2>
        <p>
          The public API reads like the DOM you meant to build. A provider coordinates the pieces, while the trigger,
          popover, value, label, and options remain visible in your component tree:
        </p>
        <CodeBlock lang="tsx" title="PlanSelect.tsx" highlight="7-15" code={planSelect} />
        <p>
          Style those parts with Tailwind, CSS modules, a generated theme, or a mess of inline styles. comp0 exposes
          state through presence attributes such as <code>data-open</code>, <code>data-selected</code>, and
          <code> data-focus-visible</code>, so the application does not have to translate a render-prop state object
          before a selector can use it.
        </p>
        <p>
          The lovely part lives inside{" "}
          <a href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/components/Select.tsx">
            <code>Select.tsx</code>
          </a>. The custom interface keeps a native select clipped down to one pixel:
        </p>
        <AnnotatedCode
          lang="tsx"
          title="packages/react/src/components/Select.tsx"
          code={nativeBridge}
          notes={[
            { line: 5, note: <>The visible trigger owns the accessible interaction, so the bridge stays out of the accessibility tree.</> },
            { line: 6, note: <>The native control still carries the field name into ordinary form submission.</> },
            { line: 10, note: <>Constraint validation can fail on the bridge without leaving focus stranded on an invisible element.</> },
            { line: 14, note: <>Clipping preserves a real form control instead of replacing the browser contract with a JavaScript imitation.</> },
          ]}
          caption="The custom listbox and the native form control share one selected value."
        />
        <p>
          Why should a prettier select stop being a form control? The bridge also participates in form reset and
          carries <code>required</code>, <code>disabled</code>, and an external <code>form</code> owner. That is the
          sort of behavior teams remember only after a design-system rewrite ships.
        </p>

        <H2>The model can paint later</H2>
        <p>
          comp0 is almost suspiciously well matched to generated interfaces. An LLM can invent the card radius,
          swap the router link through <code>as</code>, or turn a popover into a severe black rectangle without being
          asked to reinvent roving focus and form serialization in the same pass. This is the split I wanted in
          <a href="/articles/accessibility-as-creativity"> Accessibility as creativity</a>: keep meaning and behavior
          steady, and let the application own every pixel.
        </p>
        <DataTable
          head={["Component", "comp0 owns", "The application owns"]}
          rows={ownershipRows}
          caption="The library takes responsibility for interaction contracts while the rendered product keeps its visual and domain decisions."
        />
        <p>
          None of this protects you from yourself. Leave out the label, choose a confusing DOM element, or hide the
          focus indicator in your CSS, and comp0 cannot crawl back through the monitor to fix the product. What the
          split buys is that those failures sit in your application code, where a reviewer can see them, instead of
          three layers deep in a theme package.
        </p>

        <H2>It goes past the demo tier</H2>
        <p>
          Many primitive libraries become vague around interactions that cannot be explained as “open a popover.”
          comp0 contains an <code>Inventory</code> component for dashboards whose cards move and resize in grid units.
          Pointer capture, collision resolution, keyboard sessions, cancellation, and live announcements sit in the
          implementation; the application decides what a card is and whether a proposed layout is allowed.
        </p>
        <p>
          The browser test is more persuasive than a feature list. It activates a move handle, shifts a card with an
          arrow key, then verifies that leaving mid-operation restores the original layout:
        </p>
        <CodeBlock lang="tsx" title="inventory.browser.test.tsx" highlight="4-10" code={inventoryTest} />
        <p>
          That cancellation detail is tiny and excellent. Dragging demos love the successful drop; real controls
          need an answer for Escape, focus loss, blocked placements, and the person who changes their mind halfway
          through. The source even announces when a card cannot fit, rather than making the preview flash red and
          wishing keyboard users luck.
        </p>

        <H2>Somebody did the chores</H2>
        <p>
          The repository treats packaging and rendering as part of component behavior. Its{" "}
          <a href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/ssr.test.tsx">SSR test</a>{" "}
          renders a field, select, and open dialog to a string, hydrates them, checks for mismatches, and verifies the
          generated ARIA relationship. The{" "}
          <a href="https://github.com/mewhhaha/comp0/blob/main/packages/react/src/accessibility.test.tsx">
            canonical accessibility test
          </a>{" "}
          runs axe across compositions ranging from text fields to inventory grids and product tours.
        </p>
        <p>
          Before release, the package verifier builds both tarballs, installs them into a temporary consumer,
          typechecks polymorphic composition, executes the public roots, and confirms that private subpaths stay
          private. Published JavaScript is already transformed by the React Compiler, with a smoke test guarding the
          pinned compiler setup. Nobody writes a tarball verifier for fun, and finding one here told me more about
          the maintainer than the demo page did.
        </p>
        <p>
          At <code>0.1.0-next.17</code>, comp0 remains a React 19 prerelease with a broad surface and plenty of room
          for API movement. It also asks you to supply the entire visual system, a selling point that becomes a bill
          if your team wanted finished components by Friday. I would still rather evaluate that honest boundary than
          peel a library&apos;s tasteful gray CSS off forty controls.
        </p>
        <p>
          Open <code>packages/react/src/components/Select.tsx</code> and scroll to the clipped native select. It is
          one pixel wide, hidden from assistive technology, and still carrying the field name, required state, reset
          behavior, selected value, and invalid-focus handoff. Beside it sits the visible trigger, which belongs
          completely to you.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
